using SmartSpend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

using Newtonsoft.Json;

namespace SmartSpend.Services
{
    public class GroqService
    {
        // One shared HttpClient (creating one per call can exhaust sockets and cause random failures)
        private static readonly HttpClient client = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(30)
        };

        private const string Url = "https://api.groq.com/openai/v1/chat/completions";

        private readonly string apiKey;

        public GroqService(string apiKey)
        {
            this.apiKey = apiKey;
        }

        public string BuildRecommendationPrompt(AIUserContext c)
        {
            var p = new StringBuilder();

            p.AppendLine("Pick up to 10 products from CANDIDATES for this shopper.");
            p.AppendLine("Rules: use only listed candidates and data; never invent ingredients, certifications, allergens or prices; skip anything conflicting with allergies or diet. List ONLY products you recommend; never list excluded or unsuitable products.");
            p.AppendLine("Each reason: max 12 words, must name which shopper trait it serves (diet, cooking, lifestyle, product style or shopping frequency) and link it to the product's name, category, price or tags.");
            p.AppendLine("Return only JSON: {\"recommendations\":[{\"itemId\":1,\"reason\":\"...\"}]}");
            p.AppendLine();

            p.AppendLine("SHOPPER:");
            AddLine(p, "Diet", c.DietaryNeeds);
            AddLine(p, "Allergies", c.Allergies);
            AddLine(p, "Product style", c.ProductStyle);
            AddLine(p, "Cooking", c.CookingStyle);
            AddLine(p, "Lifestyle", c.Lifestyle);
            AddLine(p, "Shops", c.ShoppingFrequency);

            if (c.Favourites != null && c.Favourites.Count > 0)
            {
                p.AppendLine("Favourites: " + string.Join(", ", c.Favourites.Take(5).Select(f => f.Name)));
            }

            p.AppendLine();
            p.AppendLine("CANDIDATES (id|name|category|price|store|tags):");

            if (c.Candidates != null)
            {
                foreach (var x in c.Candidates)
                {
                    p.Append(x.Id + "|" + x.Name + "|" + x.Category + "|" + x.Price + "|" + x.Store);

                    if (!string.IsNullOrWhiteSpace(x.Tags))
                    {
                        p.Append("|" + x.Tags);
                    }

                    p.AppendLine();
                }
            }

            return p.ToString();
        }

        private static void AddLine(StringBuilder sb, string label, string value)
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                sb.AppendLine(label + ": " + value);
            }
        }

        /// <summary>
        /// Returns the model's JSON text, or null if the call failed
        /// (rate limit, network error, empty/truncated response, etc.).
        /// The controller should handle null with a fallback.
        /// </summary>
        public async Task<string> GetResponse(string prompt)
        {
            var requestBody = new
            {
                model = "openai/gpt-oss-20b",
                messages = new[] { new { role = "user", content = prompt } },
                response_format = new { type = "json_object" },
                reasoning_effort = "low",       // big token saver on gpt-oss
                max_completion_tokens = 1200,   // room for reasoning + ~10 short reasons
                temperature = 0.3
            };

            var json = JsonConvert.SerializeObject(requestBody);

            for (int attempt = 0; attempt < 2; attempt++)
            {
                try
                {
                    var request = new HttpRequestMessage(HttpMethod.Post, Url);
                    request.Headers.Add("Authorization", "Bearer " + apiKey);
                    request.Content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await client.SendAsync(request);
                    var result = await response.Content.ReadAsStringAsync();

                    // Rate limited: wait and retry once
                    if ((int)response.StatusCode == 429 && attempt == 0)
                    {
                        await Task.Delay(3000);
                        continue;
                    }

                    if (!response.IsSuccessStatusCode)
                    {
                        System.Diagnostics.Debug.WriteLine(
                            "Groq error " + (int)response.StatusCode + ": " + result);
                        return null;
                    }

                    var groq = JsonConvert.DeserializeObject<GroqResponse>(result);

                    var choice = groq?.Choices?.FirstOrDefault();
                    var text = choice?.Message?.Content;

                    if (string.IsNullOrWhiteSpace(text))
                    {
                        // Usually means reasoning used up the token budget (finish_reason = "length")
                        System.Diagnostics.Debug.WriteLine(
                            "Groq empty content. finish_reason: " + choice?.FinishReason);
                        return null;
                    }

                    return text;
                }
                catch (Exception ex) when (ex is HttpRequestException || ex is TaskCanceledException)
                {
                    // Network problem or timeout
                    System.Diagnostics.Debug.WriteLine("Groq request failed: " + ex.Message);

                    if (attempt == 0)
                    {
                        await Task.Delay(1000);
                        continue;
                    }
                }
            }

            return null;
        }

        /// <summary>
        /// Safely converts the model's JSON into recommendations. Returns an empty list on bad JSON.
        /// </summary>
        public List<AIRecommendation> ParseRecommendations(string json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return new List<AIRecommendation>();
            }

            try
            {
                var parsed = JsonConvert.DeserializeObject<AIRecommendationResponse>(json);
                return parsed?.Recommendations ?? new List<AIRecommendation>();
            }
            catch (JsonException)
            {
                return new List<AIRecommendation>();
            }
        }

        public class GroqResponse
        {
            [JsonProperty("choices")]
            public List<GroqChoice> Choices { get; set; }
        }

        public class GroqChoice
        {
            [JsonProperty("message")]
            public GroqMessage Message { get; set; }

            [JsonProperty("finish_reason")]
            public string FinishReason { get; set; }
        }

        public class GroqMessage
        {
            [JsonProperty("content")]
            public string Content { get; set; }
        }
    }
}

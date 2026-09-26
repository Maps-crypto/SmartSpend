using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace SmartSpend.Services
{
    public class GeminiService
    {

        private readonly string apiKey;

        public GeminiService(string apiKey)
        {
            this.apiKey = apiKey;
        }

        public async Task<string> TestConnection()
        {
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add(
                    "x-goog-api-key",
                    apiKey
                );

                var url =
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent";

                var json = @"{
                    ""contents"": [
                        {
                            ""parts"": [
                                {
                                    ""text"": ""Respond with exactly the word SUCCESS""
                                }
                            ]
                        }
                    ]
                }";

                var content = new StringContent(
                    json,
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await client.PostAsync(url, content);

                var result = await response.Content.ReadAsStringAsync();

                return result;
            }
        }
    }
}
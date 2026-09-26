using System;
using System.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace SmartSpend.Services
{
    // Talks directly to the Supabase Storage REST API (no SDK dependency needed).
    // Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY as environment variables.
    // The service_role key bypasses Row Level Security and must remain server-side.
    //   <add key="SupabaseBucket" value="budget-history" />
    public class SupabaseStorageService
    {
        private static readonly HttpClient http = new HttpClient();

        private readonly string _baseUrl;
        private readonly string _serviceKey;
        private readonly string _bucket;

        public SupabaseStorageService()
        {
            var supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL");
            if (string.IsNullOrWhiteSpace(supabaseUrl))
                supabaseUrl = ConfigurationManager.AppSettings["SupabaseUrl"];
            _baseUrl = (supabaseUrl ?? "").TrimEnd('/');

            _serviceKey = Environment.GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY");
            if (string.IsNullOrWhiteSpace(_serviceKey))
                _serviceKey = ConfigurationManager.AppSettings["SupabaseServiceRoleKey"];
            _bucket = ConfigurationManager.AppSettings["SupabaseBucket"];

            if (string.IsNullOrWhiteSpace(_bucket))
                _bucket = "budget-history";
        }

        public bool IsConfigured =>
            !string.IsNullOrWhiteSpace(_baseUrl) && !string.IsNullOrWhiteSpace(_serviceKey);

        // Uploads bytes to {bucket}/{path} (path can include "folders", e.g. "{userId}/file.pdf").
        // Returns the object's public URL on success, or null if the upload failed (details are
        // written to the Debug output - check that first if exports show up as "not saved").
        public async Task<string> UploadAsync(string path, byte[] content, string contentType)
        {
            if (!IsConfigured)
            {
                System.Diagnostics.Debug.WriteLine(
                    "Supabase upload skipped: configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
                return null;
            }

            var uploadUrl = $"{_baseUrl}/storage/v1/object/{_bucket}/{path}";

            using (var request = new HttpRequestMessage(HttpMethod.Post, uploadUrl))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _serviceKey);
                request.Headers.Add("apikey", _serviceKey);
                request.Headers.Add("x-upsert", "true"); // overwrite instead of erroring if the path exists

                var body = new ByteArrayContent(content);
                body.Headers.ContentType = new MediaTypeHeaderValue(contentType);
                request.Content = body;

                using (var response = await http.SendAsync(request).ConfigureAwait(false))
                {
                    if (!response.IsSuccessStatusCode)
                    {
                        var errorBody = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                        System.Diagnostics.Debug.WriteLine(
                            $"Supabase upload failed ({response.StatusCode}): {errorBody}");
                        return null;
                    }
                }
            }

            // Public-bucket URL shape. If your "budget-history" bucket is private, swap this
            // return for a call to CreateSignedUrlAsync below instead.
            return $"{_baseUrl}/storage/v1/object/public/{_bucket}/{path}";
        }

        // Use this instead of the plain public URL above if the bucket is PRIVATE.
        // Returns a URL that works for `expiresInSeconds` and then stops working.
        public async Task<string> CreateSignedUrlAsync(string path, int expiresInSeconds = 60 * 60 * 24 * 7)
        {
            if (!IsConfigured)
                return null;

            var signUrl = $"{_baseUrl}/storage/v1/object/sign/{_bucket}/{path}";

            using (var request = new HttpRequestMessage(HttpMethod.Post, signUrl))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _serviceKey);
                request.Headers.Add("apikey", _serviceKey);
                request.Content = new StringContent(
                    $"{{\"expiresIn\":{expiresInSeconds}}}",
                    System.Text.Encoding.UTF8,
                    "application/json");

                using (var response = await http.SendAsync(request).ConfigureAwait(false))
                {
                    var json = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                    if (!response.IsSuccessStatusCode)
                    {
                        System.Diagnostics.Debug.WriteLine(
                            $"Supabase sign-url failed ({response.StatusCode}): {json}");
                        return null;
                    }

                    // Response looks like {"signedURL":"/object/sign/bucket/path?token=..."}
                    var marker = "\"signedURL\":\"";
                    var start = json.IndexOf(marker, StringComparison.Ordinal);
                    if (start < 0) return null;
                    start += marker.Length;
                    var end = json.IndexOf('"', start);
                    if (end < 0) return null;

                    var signedPath = json.Substring(start, end - start).Replace("\\/", "/");
                    return $"{_baseUrl}/storage/v1{signedPath}";
                }
            }
        }
    }
}

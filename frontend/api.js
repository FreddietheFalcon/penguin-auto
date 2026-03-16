// api.js — shared API base URL config
// Include this in every HTML page with:
// <script src="api.js"></script>

const API = (() => {
    // If running on Railway (production), API is on the same domain
    if (window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1") {
        return window.location.origin + "/api";
    }
    // Local development — backend runs on port 5001
    return "http://localhost:5001/api";
})();

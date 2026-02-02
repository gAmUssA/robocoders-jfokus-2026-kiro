# Shelly Gen1 API Documentation

## Important: Always Use Context7

When working with Shelly Gen1 IoT device APIs, **always use Context7 documentation lookup** instead of relying on pretrained knowledge. The API details, endpoints, parameters, and response formats must be verified against current documentation.

## How to Use Context7 for Shelly API

1. Use `mcp_Context7_resolve_library_id` to find the Shelly documentation library
2. Use `mcp_Context7_query_docs` with the library ID to get current API details
3. Verify endpoint formats, parameter names, and response structures
4. Check for any authentication requirements or headers needed

## Why This Matters

- API endpoints and parameters may have changed since training data
- Shelly Gen1 devices have specific HTTP API requirements
- Color control endpoints need exact parameter names and formats
- Timeout and error handling requirements must be accurate for live demos

## Example Queries for Context7

- "Shelly Gen1 HTTP API color control endpoint"
- "Shelly Gen1 bulb RGB color parameters"
- "Shelly Gen1 API response format and status codes"
- "Shelly Gen1 device connection and authentication"

## Current Known Requirements (to be verified)

- Device: Shelly Gen1 smart bulb
- Protocol: HTTP REST API
- Endpoint format (verify with Context7): `http://<ip>/color/0?turn=on&red=<r>&green=<g>&blue=<b>`
- Timeout: 2 seconds per request
- No authentication required (verify with Context7)

**Always verify these details with Context7 before implementation.**

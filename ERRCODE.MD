# ❌ FORBIDDEN ERRCODE.md

This document lists all standardized error codes used in the `Fioso` or `Forbidden` system.

---

## 🔁 GENERAL ERRORS

| Code                  | Message                                      | Description                                   |
|-----------------------|----------------------------------------------|-----------------------------------------------|
| FORBIDDEN_0x000101    | `[Forbidden]: Invalid API key`               | API key is missing or incorrect               |
| FORBIDDEN_0x000102    | `[Forbidden]: Missing required parameters`   | One or more required fields are not provided |
| FORBIDDEN_0x000103    | `[Forbidden]: Request timed out`             | Request exceeded time limit                   |
| FORBIDDEN_0x000104    | `[Forbidden]: Endpoint not found`            | API path or route is invalid                  |

---

## 📦 DATA ERRORS

| Code                  | Message                                        | Description                                      |
|-----------------------|------------------------------------------------|--------------------------------------------------|
| FORBIDDEN_0x000201    | `[Forbidden]: Data fetch failed`              | Data could not be retrieved from source         |
| FORBIDDEN_0x000202    | `[Forbidden]: Data parsed but not valid`      | JSON was valid but not the expected format      |
| FORBIDDEN_0x000203    | `[Forbidden]: Empty data returned`            | No usable data in the API response              |
| FORBIDDEN_0x000204    | `[Forbidden]: Expired or outdated data`       | Data is older than the allowed window           |

---

## 🔐 AUTH / PERMISSION

| Code                  | Message                                         | Description                              |
|-----------------------|-------------------------------------------------|------------------------------------------|
| FORBIDDEN_0x000301    | `[Forbidden]: Unauthorized access`              | User not permitted to access this route  |
| FORBIDDEN_0x000302    | `[Forbidden]: Token expired`                    | Auth token is no longer valid            |
| FORBIDDEN_0x000303    | `[Forbidden]: Forbidden command`                | Command restricted for this user         |

---

## 🧪 INTERNAL TEST ERRORS

| Code                  | Message                                         | Description                              |
|-----------------------|-------------------------------------------------|------------------------------------------|
| FORBIDDEN_0x000401    | `[Forbidden]: Test mode error`                  | Test mode failed validation              |
| FORBIDDEN_0x000402    | `[Forbidden]: Module not responding`            | One of the modules didn't reply          |
| FORBIDDEN_0x000403    | `[Forbidden]: Test timeout`                     | Test check exceeded time limit           |

---

## ☠️ CRITICAL / UNKNOWN

| Code                  | Message                                         | Description                                      |
|-----------------------|-------------------------------------------------|--------------------------------------------------|
| FORBIDDEN_0x000404    | `[Forbidden]: Unknown fatal error`              | Something unexpected broke                       |
| FORBIDDEN_0x000405    | `[Forbidden]: System corrupted`                 | Runtime corruption detected                      |
| FORBIDDEN_0x000406    | `[Forbidden]: Invalid response type`           | Response type or structure is broken             |
| FORBIDDEN_0x010404    | `[Forbidden]: Fetch error - <message>`          | Request failed due to fetch/network error        |

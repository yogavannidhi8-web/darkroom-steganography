# SINGLE-PROMPT AUTONOMOUS BUILD DIRECTIVE
## Capstone: A Secure Adaptive Image Steganography System with Encryption, Integrity Verification and Image Quality Analysis

> **Instruction to Antigravity:** This file is the complete project brief. Treat it as the only specification you need. The workspace may be completely empty. Do not return a plan and stop. Build the application, run it, test it, document it, prepare deployment, and deploy it wherever the required accounts are already authenticated. Make reasonable engineering decisions without asking the student to choose libraries, colors, folder names, algorithms, or implementation details. Ask for user action only when an external account must be authenticated or an unavoidable permission/payment decision is required.

---

# 0. THE OUTCOME I EXPECT

Build a complete, working, polished, academically defensible full-stack capstone application for:

**A SECURE ADAPTIVE IMAGE STEGANOGRAPHY SYSTEM WITH ENCRYPTION, INTEGRITY VERIFICATION AND IMAGE QUALITY ANALYSIS**

The final result must be an actual application—not a prototype made of static screens, not a Figma-like mockup, not a collection of disconnected components, and not only a Python script.

The project must let a user:

1. Select a lossless cover image.
2. Enter a secret message or upload a secret file.
3. Protect the payload using a password-derived encryption key and authenticated encryption.
4. Analyze the cover image and choose embedding locations adaptively according to local image characteristics.
5. Embed the encrypted payload into the cover image using a reproducible, key-dependent embedding order.
6. Download the resulting stego image.
7. Upload a stego image and recover the secret using the correct password.
8. Verify authenticated decryption and the original payload's SHA-256 digest.
9. Compare cover and stego image quality through real measured metrics.
10. Compare the proposed method with simpler baseline methods.
11. Export experiment results for the capstone report.
12. Run locally and deploy online, subject only to actual account authentication or hosting-provider limitations.

The result must be understandable to a B.Tech student and demonstrable in a project review and viva.

## Definition of done

The project is not finished until all of these are true:

- The frontend and backend run locally.
- Encode works with both text and files.
- Decode works with the correct password.
- A wrong password is rejected without releasing data.
- A modified stego payload is rejected.
- A saved and reloaded PNG can be decoded successfully.
- The adaptive map is identical during encoding and extraction.
- Capacity is calculated before embedding.
- MSE, PSNR, SSIM and the other displayed metrics are computed from actual images.
- Baseline comparisons use the same carrier and payload size.
- The UI is responsive, accessible, visually coherent and fully functional.
- Automated tests pass.
- Frontend production build passes.
- Deployment configuration is present and validated.
- A real deployment is performed when Git and hosting authentication are available.
- Documentation describes the actual code—not a fictional implementation.
- No made-up benchmark numbers, deployment URLs, test results or API keys appear anywhere.

---

# 1. AUTONOMOUS EXECUTION RULES

You are acting as the lead product designer, frontend engineer, backend engineer, image-processing engineer, cryptography engineer, QA engineer, DevOps engineer and technical writer.

## 1.1 Do not stop after planning

You may create an internal implementation plan, but continue into implementation immediately.

Do not respond with:
- “Here is how you can build it.”
- “The next step is to create the backend.”
- “You should install these packages.”
- “Would you like me to continue?”
- “I have created a basic UI; the rest can be added later.”

Actually create and connect the files, run the code, find failures, fix them and complete the work.

## 1.2 Make decisions independently

Do not ask the user to choose:
- frontend framework,
- backend framework,
- folder structure,
- cryptographic libraries,
- image-processing libraries,
- chart libraries,
- design colors,
- typography,
- page layout,
- API route names,
- test framework,
- deployment configuration.

Use the decisions in this specification. If a small implementation detail is unspecified, select a secure, maintainable and straightforward option.

## 1.3 Inspect before changing

At the start:

1. Inspect the current working directory.
2. Inspect existing files, Git status, Git remotes and installed runtimes.
3. Preserve useful files if any exist.
4. If the directory is empty, create the project from scratch.
5. Do not overwrite unrelated user files.
6. Confirm Python, Node.js, npm, Git and browser-testing availability.
7. Record the available deployment/authentication tools without exposing tokens.

## 1.4 Use tools, not claims

Use the terminal, filesystem, browser, Git and testing tools available to you. If a browser automation tool is available, use it for deployment and visual QA.

Never claim that a test passed unless you ran it and observed its result.

Never claim that deployment succeeded unless the deployed URL responds successfully and the production health check passes.

## 1.5 No unnecessary user interruptions

Do not ask the user questions just to resolve routine engineering choices.

The only legitimate blockers that may require user action are:
- signing in to GitHub or another Git provider,
- signing in to the selected hosting provider,
- granting repository access,
- supplying a deployment credential through the provider's secure authentication flow,
- explicitly approving a paid hosting plan or charge.

When a sign-in is needed, open the provider's official sign-in flow if browser tools allow it. Do not ask the user to paste private tokens into chat, source files, terminal commands, screenshots or this Markdown file.

Continue all work that does not depend on the missing authentication. Do not leave the application unfinished merely because deployment authentication is unavailable.

## 1.6 Do not fabricate

Never invent:
- research results,
- benchmark values,
- PSNR or SSIM scores,
- test success,
- a deployed URL,
- a GitHub repository,
- an API key,
- a security certification,
- a claim that the algorithm is impossible to detect.

Use actual code execution and observed output.

---

# 2. PRODUCT AND TECHNICAL VISION

Build this as a compact **image-security research workstation**.

It is not a general-purpose SaaS dashboard. It is a focused application for preparing, embedding, extracting, verifying and evaluating hidden information in images.

The core system combines five separate functions:

| Function | Responsibility |
|---|---|
| Encryption | Protect the contents of the secret payload |
| Steganography | Conceal the encrypted payload inside a carrier image |
| Adaptive embedding | Choose image regions according to local image characteristics |
| Integrity verification | Reject wrong passwords, corrupted payloads and tampering |
| Image-quality analysis | Measure the visual effect of embedding |

Explain these distinctions clearly in the UI and documentation. Do not describe encryption, concealment, integrity and quality measurement as though they are the same thing.

## 2.1 Product naming

Use a restrained working identity:

**DARKROOM / IMAGE SECURITY LAB**

Keep the academic project title visible in the About/Methodology area and in the README.

This is a UI identity only. Do not spend time on logo-generation services, trademark searches or external branding APIs. Create a typographic wordmark using text and CSS.

## 2.2 Intended users

- Student demonstrating the capstone.
- Faculty evaluating the implementation.
- A user who wants to hide and later recover a message or file.
- A student comparing simple LSB embedding with adaptive embedding.

## 2.3 Product behavior

The system should be private by default:
- No user account is needed.
- No database is needed.
- No persistent upload library is needed.
- No secret content is stored after a request.
- No analytics or third-party tracking is needed.
- No external AI service is needed.

The application is stateless. Uploaded content is processed in memory where practical. If temporary files are unavoidable, use random temporary names, restrictive permissions and guaranteed cleanup in `finally` blocks.

The application must clearly explain that, in the deployed version, uploaded images, payloads and passwords are transmitted to the student's backend over HTTPS for processing. They must not be logged or retained. Do not falsely claim that the server cannot see the password or plaintext payload.

---

# 3. REQUIRED TECHNOLOGY STACK

Use this stack unless a current compatibility issue makes a small, documented change necessary.

## 3.1 Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- CSS-variable-based design tokens
- Radix UI primitives and/or carefully selected shadcn/ui primitives
- React Router for application navigation
- Recharts for analytical charts
- Lucide icons
- JSZip for reading the backend's result archives
- React Hook Form or equivalent typed form handling
- Zod or equivalent schema validation
- Vitest and React Testing Library
- Playwright for end-to-end tests if browser automation is available

Use current stable, compatible releases at implementation time. Pin dependencies with a lockfile. Do not blindly copy old setup commands from tutorials.

### Important component-library rule

shadcn/ui and Radix may be used as accessible foundations, not as the visual identity.

Do not leave default shadcn styling untouched and call the result custom. Customize typography, proportions, colors, borders, interaction states, page composition and component density to match the design section below.

## 3.2 Backend

- Python 3.11 or a currently supported stable Python version
- FastAPI
- Uvicorn
- Pydantic
- NumPy
- OpenCV headless package
- Pillow
- scikit-image
- SciPy where useful
- `cryptography`
- `argon2-cffi`
- `python-multipart`
- Pytest
- HTTPX for API tests

Use a locked or reproducibly pinned dependency set.

## 3.3 Why Python + FastAPI

The image-analysis and embedding algorithms belong in Python because NumPy, OpenCV, Pillow and scikit-image provide appropriate image-processing primitives. FastAPI exposes these operations to the React client through a documented REST API.

Do not introduce:
- a database without a real requirement,
- Redis,
- Celery,
- Kubernetes,
- microservices,
- a paid AI model,
- a cloud object-storage system,
- unnecessary login/authentication infrastructure.

This project is a stateless processing application. Keep the backend focused.

---

# 4. CRYPTOGRAPHIC DESIGN — MANDATORY

The cryptographic layer must be correct. Do not invent a cipher or write custom cryptographic primitives.

## 4.1 Password-based key derivation

Use **Argon2id** to derive a 256-bit encryption key from the user's passphrase.

Use at least the currently recommended OWASP baseline unless measured deployment constraints require a documented adjustment:

- Argon2id
- memory cost: at least 19 MiB
- iterations/passes: at least 2
- parallelism: at least 1
- output: 32 bytes
- fresh cryptographically random 16-byte salt for each encode operation

The parameter set must be versioned through an allow-listed KDF identifier in the bootstrap header. Do not accept arbitrary memory or iteration values from untrusted header bytes. This prevents a malformed image from requesting unbounded KDF work.

Benchmark the selected Argon2id parameters on the actual local system and deployed resource profile. If a reduction is unavoidable for the demo environment, document it explicitly and never silently downgrade.

A fresh salt is generated with the operating system's cryptographically secure random source.

## 4.2 Encryption

Use **AES-256-GCM** from the maintained `cryptography` package.

Requirements:

- 256-bit AES key.
- Fresh 96-bit nonce for every encryption.
- Never reuse a nonce with the same key.
- Encrypt the serialized payload package.
- Use the complete serialized bootstrap header as associated authenticated data (AAD).
- Keep the GCM authentication tag.
- Treat authentication failure as a hard failure.
- Do not return any plaintext if authentication fails.

Do not use:
- AES-ECB,
- custom XOR encryption,
- a homemade stream cipher,
- a hard-coded key,
- a password directly as an AES key,
- a repeated nonce,
- a fixed global salt.

## 4.3 Key separation

Derive separate subkeys for separate purposes.

Use HKDF-SHA256 (or another established KDF construction) with distinct context strings to derive:
- the AES-GCM encryption key, if not used directly from the Argon2id output,
- the key used to initialize the deterministic position-ordering generator.

Never reuse one raw key for unrelated cryptographic purposes without domain separation.

## 4.4 Integrity model

Implement two checks:

**A. AES-GCM authentication**

This authenticates the ciphertext and associated header. It detects wrong passwords and modification of authenticated data.

**B. SHA-256 payload digest**

Before encryption, compute:

`SHA256(original_payload_bytes)`

Store this digest inside the encrypted payload package.

After successful authenticated decryption, recompute SHA-256 over the recovered bytes and compare using a constant-time comparison where applicable.

Only release the recovered file/message when:
1. AES-GCM authentication succeeds, and
2. the SHA-256 digest matches.

The UI must display these as separate, clearly named checks.

Do not claim SHA-256 alone proves sender identity or authenticity. AES-GCM supplies authenticated encryption; the digest is an additional payload-integrity verification step.

---

# 5. PAYLOAD FORMAT AND BOOTSTRAP HEADER

Design a versioned binary format. Do not use a fragile delimiter-separated text format for the encrypted binary payload.

## 5.1 Inner payload package

Serialize an inner package containing:

- inner magic identifier,
- inner format version,
- payload type (`text` or `file`),
- safe original filename for file payloads,
- original payload byte length,
- SHA-256 digest,
- original payload bytes.

Use explicit, length-prefixed fields and a documented byte order.

For filenames:
- store only a sanitized basename,
- reject path separators and traversal sequences,
- do not trust user-provided directory paths,
- preserve the useful extension.

For a text message:
- encode as UTF-8,
- recover and display only after authentication and digest verification.

## 5.2 Fixed bootstrap header

Extraction needs a small deterministic header before it can derive the password-based key and reconstruct the adaptive locations.

Use a versioned fixed-size bootstrap header of approximately 64 bytes. Define and document an exact binary struct layout. A suggested 64-byte layout is:

| Field | Size |
|---|---:|
| Magic identifier | 8 bytes |
| Format version | 1 byte |
| KDF identifier | 1 byte |
| Embedding algorithm identifier | 1 byte |
| Adaptive configuration identifier | 1 byte |
| Salt | 16 bytes |
| GCM nonce | 12 bytes |
| Encrypted package length | 8 bytes |
| Image width | 4 bytes |
| Image height | 4 bytes |
| Reserved/version flags | 4 bytes |
| Header CRC32 | 4 bytes |
| **Total** | **64 bytes** |

Use a clear, fixed endian convention, such as big-endian.

The CRC32 is only an early corruption/format check; it is not a security mechanism. The complete serialized header must also be authenticated as AES-GCM AAD.

The header must not contain:
- the passphrase,
- the derived AES key,
- plaintext secret content,
- a private key,
- any reusable secret.

The header must have strict parsing and validation:
- magic identifier,
- supported version,
- supported KDF ID,
- supported algorithm ID,
- supported adaptive configuration ID,
- plausible dimensions,
- safe encrypted payload length,
- valid CRC,
- sufficient image dimensions for header storage.

Reject invalid headers before allocating large arrays or starting a costly KDF operation.

## 5.3 Header embedding

Embed the fixed header into a deterministic sequence of the first 512 RGB channel values, using one LSB per channel.

Reserve those exact channel positions. They must not be used for the main payload.

The header is intentionally a small bootstrap structure, not the hidden payload itself. The main encrypted payload must use the adaptive, key-dependent embedding locations.

The header's integrity is protected by being included as AES-GCM AAD.

---

# 6. ADAPTIVE IMAGE ANALYSIS — CRITICAL ALGORITHM

Implement a spatial-domain adaptive method that can be reproduced exactly during extraction.

Do not make the extraction algorithm depend on a feature map that changes when the payload is embedded.

## 6.1 Carrier image policy

For reliable recovery, use lossless carriers.

Accept valid single-frame lossless PNG as the primary supported format. Additional lossless BMP/TIFF input support may be added if tested correctly. The output must be a PNG.

Reject lossy JPEG as an embedding carrier, or explain that it must first be converted to a lossless carrier and that conversion may alter the image. Do not promise extraction after JPEG compression.

Validate the actual image bytes by decoding them. Do not trust the extension or browser-supplied MIME type alone.

Normalize images into a documented 8-bit RGB working representation. If the input has an alpha channel, preserve it unchanged while embedding only in RGB channels. Do not modify alpha. Document grayscale conversion behavior.

Use a bounded pixel limit and request size to protect memory. Choose a realistic default (for example, 6–8 megapixels on a small free deployment) and make the limit configurable. Display the actual limit in the UI. Never accept an unbounded decompression-bomb image.

## 6.2 The reproducibility requirement

**This is one of the most important engineering constraints in the entire project.**

A naive design recalculates Sobel/Canny/variance features from the modified stego pixels during extraction. That can change the adaptive map and therefore change the selected embedding locations. The decoder then reads different locations and fails.

Prevent this.

For both encoding and extraction, create a stable analysis image by clearing the two least significant bits of each RGB channel:

`analysis_rgb = rgb & 0xFC`

Then calculate grayscale, gradient, local variance and edge information from this stable upper-six-bit representation.

The actual embedding algorithm may modify only the lowest one or two bits of a channel. Clearing those two bits before analysis therefore reconstructs the same analysis representation from the original cover and from the corresponding stego image.

Add automated tests proving that:

`analysis_map(original_cover) == analysis_map(stego_image)`

for the supported embedding rules.

This is mandatory. Do not ship an implementation that cannot deterministically recreate its adaptive map.

## 6.3 Feature map

Compute the following from the stable analysis image:

1. Grayscale/luminance representation.
2. Sobel horizontal and vertical gradients.
3. Gradient magnitude.
4. Local variance using an efficient box filter or equivalent neighborhood calculation.
5. Canny edge map.

Normalize gradient magnitude and local variance robustly, such as using bounded percentiles. Avoid division by zero for flat images.

Create a score map:

`score = w1 * normalized_gradient + w2 * normalized_local_variance + w3 * edge_indicator`

Use a documented starting configuration, for example:

- gradient weight: 0.50
- local variance weight: 0.30
- edge indicator weight: 0.20

These are configurable engineering starting weights, not claims of globally optimal scientific values.

Normalize or clip the final score to `[0, 1]`.

## 6.4 Adaptive bit allocation

Use three score bands:

| Score band | Bits per RGB channel |
|---|---:|
| Low-texture / low-gradient | 0 |
| Medium suitability | 1 |
| High suitability | 2 |

Use clear, versioned thresholds. A reasonable initial configuration is:

- score below 0.25: 0 bits,
- 0.25 to below 0.55: 1 bit,
- 0.55 and above: 2 bits.

Allow a small number of named, versioned presets only if they can be reconstructed from the bootstrap configuration identifier, for example:
- Conservative,
- Balanced,
- Higher Capacity.

Do not expose arbitrary advanced sliders unless the backend can serialize and safely reproduce every setting during extraction.

When a slot has 1-bit allocation, modify only the LSB.
When a slot has 2-bit allocation, modify only the two LSBs.
Never modify higher-order bits as part of this version of the algorithm.

## 6.5 Candidate slots

For each pixel:
- determine its adaptive bit allocation,
- create RGB channel slots for that pixel when the allocation is non-zero,
- assign each slot a width of 1 or 2 bits,
- exclude every reserved bootstrap-header channel position.

Keep slot order and indexing explicit, deterministic and documented.

Calculate total payload capacity as the sum of usable slot widths.

Do not count header bits as payload capacity.

## 6.6 Key-dependent ordering

The main payload's candidate slots must be placed in a deterministic, password-dependent pseudo-random order.

Use a separate derived position key and a cryptographically secure deterministic construction, such as a ChaCha20-generated random stream plus a deterministic shuffle/permutation.

Do not use Python's ordinary `random` module for security-sensitive location ordering.

Do not use an unkeyed shuffle.

Encoding and extraction must produce exactly the same order from:
- the same stego/cover dimensions,
- the stable upper-six-bit analysis map,
- the same password,
- the salt stored in the header,
- the same algorithm/configuration version.

Document the ordering construction and its limitations. The main confidentiality protection remains AES-GCM; do not claim that permutation alone encrypts the data.

Use an implementation that respects the memory limit. Benchmark it with realistically sized images. If a full materialized permutation is too large, use a deterministic, testable block-wise or indexed permutation approach.

## 6.7 Embedding behavior

- Convert encrypted package bytes to a deterministic bitstream.
- Embed the stream in the permuted candidate slots.
- Use each slot's allocated width.
- Write exactly the required number of bits.
- Pad only the unused part of the final channel slot in a deterministic way.
- Keep all unselected/high-order image bits unchanged.
- Save as lossless PNG.
- Return a clear capacity error before attempting an embedding that cannot fit.
- Never truncate a payload silently.

## 6.8 Extraction behavior

The extractor must:

1. Decode the lossless stego image.
2. Read the fixed bootstrap header.
3. Validate magic, version, CRC, dimension fields, algorithm IDs and length limits.
4. Recreate the stable upper-six-bit analysis representation.
5. Recreate the adaptive feature map.
6. Recreate the candidate slot list.
7. Derive the same position key from the password and header salt.
8. Recreate the deterministic slot order.
9. Extract exactly the encrypted package length stored in the header.
10. Authenticate/decrypt with AES-GCM using the header as AAD.
11. Parse the inner package with strict bounds.
12. Verify the decrypted payload length.
13. Verify the SHA-256 digest.
14. Release the recovered data only if every required check passes.

Do not release partial plaintext when any authentication or integrity step fails.

---

# 7. BASELINE METHODS AND EXPERIMENTAL CONTRIBUTION

The project must demonstrate more than a single adaptive LSB method.

Implement and compare at least these three methods:

## Baseline A — Sequential 1-LSB

Embed one payload bit in successive available RGB channel LSBs using a simple deterministic order.

## Baseline B — Key-permuted 1-LSB

Embed one payload bit in a key-derived pseudo-random order, without adaptive 0/1/2-bit allocation.

## Proposed method — Adaptive edge/texture-aware embedding

Use the feature map, adaptive bit allocation, reserved bootstrap header and key-dependent candidate order.

All three methods must use the same:
- input carrier image,
- payload bytes,
- encryption/package overhead where applicable,
- payload size,
- quality metric implementation.

Do not compare different payload sizes and then claim a method has better quality.

Report actual results. Do not pre-fill a table with expected values.

The capstone contribution is the integrated, tested system and experimental comparison—not a claim that AES, SHA-256 or LSB steganography was invented here.

Use a defensible contribution statement:

> This project implements an integrated adaptive image steganography framework combining content-aware spatial embedding, password-derived authenticated encryption, integrity verification and quantitative image-quality evaluation, with experimental comparison against simpler LSB baselines.

---

# 8. IMAGE QUALITY AND ANALYSIS ENGINE

This is a major part of the project, not a decorative dashboard.

All metrics must be computed from actual cover/stego arrays in the backend.

## 8.1 Required metrics

### Mean Squared Error (MSE)

Calculate the average squared difference between corresponding cover and stego pixel values, with safe numeric types to avoid uint8 overflow.

Lower MSE means less pixel-level error.

### Peak Signal-to-Noise Ratio (PSNR)

Calculate PSNR from MSE using the correct maximum possible signal value for the image representation (255 for 8-bit channels).

Handle zero MSE explicitly and return a well-defined representation such as infinity/`null` plus a display label.

Higher PSNR indicates lower pixel-level distortion.

### Structural Similarity Index (SSIM)

Use `skimage.metrics.structural_similarity` or an equivalent validated implementation.

- Compare aligned images with identical dimensions.
- Pass `data_range=255` for 8-bit values.
- Set `channel_axis` correctly for RGB.
- Handle small images with an appropriate valid window size.
- Do not compare images of different dimensions without an explicit documented registration/resizing procedure. For this project, reject mismatched pairs.

SSIM evaluates structural similarity and complements MSE/PSNR; it is not interchangeable with them.

### Additional metrics

Implement:
- entropy of cover and stego image,
- RGB histogram comparison,
- changed-pixel count,
- changed-pixel ratio,
- changed-channel ratio,
- edge density,
- estimated capacity,
- required payload bits,
- capacity utilization,
- encode duration,
- decode duration.

Provide clear formulas and metric explanations in the Methodology screen and documentation.

## 8.2 Visual analysis

Create real visualizations:
- cover image preview,
- stego image preview,
- synchronized side-by-side comparison,
- before/after slider or wipe comparison,
- difference heatmap,
- edge map,
- adaptive score map,
- RGB histograms,
- metric cards with units and explanatory labels.

Never render fake chart data or arbitrary hard-coded metrics.

## 8.3 Optional statistical diagnostics

Implement useful, clearly labelled comparative indicators where feasible:
- adjacent-pixel correlation (horizontal, vertical and diagonal),
- simple chi-square indicator for LSB distribution.

Treat them as diagnostic indicators only.

Do not label an image “undetectable,” “secure from steganalysis,” or “steganography-proof” because one test returns a favorable result.

RS analysis may be included as a documented advanced diagnostic only if implemented and tested correctly. It is not required to complete the core release.

---

# 9. COMPLETE APPLICATION EXPERIENCE

Create a cohesive application with these functional areas.

## 9.1 Application shell

- Brand wordmark: `DARKROOM / IMAGE SECURITY LAB`.
- Persistent navigation on desktop.
- Compact menu/navigation on mobile.
- Clear page title and context.
- A subtle status line such as `LOCAL PROCESSING / SECURE WORKFLOW` only when it accurately describes the current environment.
- About/methodology section with the full academic project title.
- No user login.
- No database.
- No subscription or pricing pages.

## 9.2 Overview page

Show a compact operational introduction:
- what the system does,
- the five security/analysis stages,
- direct actions to Encode, Decode and Analyze,
- a genuine sample preview generated locally or an empty-state image-analysis illustration,
- a small “How it works” process line.

Do not invent activity history, user counts, security scores or fake analytics.

## 9.3 Encode page

Required functionality:

**Carrier**
- Upload or drag-and-drop a lossless cover image.
- Show actual dimensions, format and file size.
- Show a preview.
- Explain why lossy JPEG is not a reliable carrier.
- Run pre-encoding analysis.
- Display estimated adaptive capacity.

**Secret payload**
- Switch between secret text and secret file.
- Text area for message.
- File picker for a secret file.
- Show payload size.
- Show selected filename without exposing its contents unnecessarily.

**Protection**
- Password input.
- Show/hide password control.
- Confirm password for encoding.
- Require a sensible minimum passphrase length and explain that losing the passphrase means the payload cannot be recovered.
- Never log or retain the password.
- Never pre-fill a password.

**Embedding**
- Select named adaptive preset, if presets are implemented.
- Show the allocation method.
- Show required bits, total available bits and capacity utilization.
- Block encode when payload does not fit.
- Explain that encoding creates a PNG carrier.

**Result**
- Display the resulting stego image.
- Display actual PSNR, SSIM, MSE, changed-pixel ratio, payload bytes and capacity utilization.
- Provide separate downloads for the stego PNG and analysis report.
- Provide a clear next step to verify the stego image on the Decode page.

All controls must work.

## 9.4 Decode & Verify page

Required functionality:
- Upload a stego PNG.
- Enter password.
- Decode and verify.
- Show staged progress without faking completion:
  1. Read header.
  2. Reconstruct adaptive map.
  3. Extract encrypted package.
  4. Authenticate/decrypt.
  5. Verify SHA-256 digest.
- Show separate statuses for:
  - Header validation,
  - AES-GCM authentication,
  - SHA-256 digest verification.
- If successful, display the recovered text or provide the recovered file download.
- If the passphrase is wrong or the image has been modified, do not reveal partial content.
- Give clear, non-leaking errors.

Do not make an unverified image appear verified.

## 9.5 Image Analysis page

Allow the user to upload:
- a cover image,
- a corresponding stego image.

Show:
- dimensions and format,
- MSE,
- PSNR,
- SSIM,
- entropy before and after,
- histogram comparison,
- edge density,
- changed-pixel ratio,
- difference heatmap,
- adaptive map visualization.

Require matching dimensions and compatible image representation.

## 9.6 Benchmark page

Allow selection of:
- carrier image,
- payload text/file or generated payload of a chosen size,
- baseline algorithm,
- proposed algorithm,
- payload-size series within carrier capacity.

Run actual benchmarks.

Show a sortable results table with:
- method,
- carrier,
- resolution,
- payload size,
- capacity,
- utilization,
- MSE,
- PSNR,
- SSIM,
- entropy change,
- changed-pixel ratio,
- encode time,
- decode time,
- round-trip integrity.

Provide:
- CSV export,
- JSON export,
- comparison charts.

Clearly mark incomplete or failed runs. Never make a failed run look successful.

## 9.7 Methodology / About page

Explain in understandable language:
- the problem statement,
- project objectives,
- system architecture,
- encryption,
- adaptive image analysis,
- embedding and extraction,
- integrity verification,
- quality metrics,
- baselines,
- limitations.

Include a system architecture diagram and a concise algorithm flow.

---

# 10. VISUAL DESIGN — DO NOT MAKE AN AI-GENERATED TEMPLATE

This section is mandatory. The UI is a core deliverable.

The visual objective is:

**A distinctive editorial image-forensics workstation: Swiss editorial layout discipline combined with the quiet precision of an analogue photographic darkroom and a modern scientific instrument.**

Do not build a generic admin dashboard.

A component library does not create an art direction. Establish the design system before composing pages.

## 10.1 Design principles to apply

Use established graphic-design and interface principles deliberately:

1. **Grid and alignment:** use a consistent modular grid. Align page titles, image previews, controls, metrics and chart edges to shared columns.
2. **Hierarchy:** create a clear order through size, weight, contrast, spacing and position. Every screen should have one dominant task.
3. **Proximity:** group related inputs and outputs. Keep labels close to controls and metrics close to their explanations.
4. **Similarity and repetition:** repeat a small, consistent set of visual treatments for section numbers, metadata, controls, status states and metric labels.
5. **Contrast:** use contrast to distinguish action, status, primary information and supporting detail—not as decoration.
6. **Whitespace:** leave deliberate breathing room. Do not fill every empty area with cards or ornament.
7. **Balance:** use controlled asymmetry and different column widths, balanced by alignment and visual weight.
8. **Typography:** use a coherent type scale and line lengths. Do not use arbitrary font sizes on every component.
9. **Color restraint:** use a limited palette with semantic meanings.
10. **Data integrity:** visualizations must represent real measurements, with honest scales, units and labels.

Use an 8-point spacing system, with 4-point adjustments where necessary. Use a 12-column desktop grid and an intentional 4-column mobile layout. Apply optical alignment where text and icons require it.

Do not blindly apply the golden ratio to every dimension. Make proportions serve content and usability.

## 10.2 Art direction

Use a warm, restrained, tactile palette. Suggested starting tokens:

| Token | Suggested value | Purpose |
|---|---|---|
| `--paper` | `#F2F0E8` | Main page background |
| `--paper-raised` | `#FAF9F4` | Work surfaces |
| `--ink` | `#20231F` | Main text |
| `--ink-soft` | `#555A52` | Secondary text |
| `--line` | `#D7D4C9` | Hairline borders |
| `--darkroom` | `#202522` | Image/preview work surface |
| `--signal` | `#C45A3D` | Primary action / important signal |
| `--signal-soft` | `#EBD8CE` | Soft emphasis |
| `--success` | `#526D4C` | Verified state |
| `--warning` | `#A56A2A` | Capacity/error warning |

These are starting values. Adjust them after checking real contrast ratios. Do not use a color if it fails accessibility.

Avoid the default purple/blue AI-product palette.

Do not use:
- giant purple-to-blue gradients,
- random neon gradients,
- translucent glass cards,
- excessive backdrop blur,
- floating glowing blobs,
- ornamental 3D AI shapes,
- meaningless wave graphics,
- oversized rounded pills for every label,
- emoji as icons,
- gradients behind every section,
- endless rounded cards,
- generic stock photos,
- decorative dashboards containing fake metrics.

A subtle paper/film grain may be used as a low-opacity CSS texture, but it must not reduce legibility or create distracting noise.

## 10.3 Typography system

Use a purposeful three-role type system. Preferred direction:

- **Display / editorial headings:** Newsreader or a similarly refined editorial serif.
- **Interface and body:** DM Sans or a similarly clear sans-serif.
- **Technical metadata and measurements:** IBM Plex Mono.

Bundle fonts locally through a maintained font package such as `@fontsource`. Do not depend on a remote font API at runtime.

Define explicit tokens for:
- display,
- page heading,
- section heading,
- body,
- labels,
- captions,
- numeric metrics,
- monospaced metadata.

Use tabular numerals for metrics. Use readable line-height and sensible text measure. Avoid all-caps for long sentences; reserve it for small technical labels and navigation metadata.

## 10.4 Layout system

Desktop:
- compact top header,
- a narrow left navigation rail or editorial side index,
- a spacious main work canvas,
- asymmetric content columns where appropriate,
- thin rules and section indexes,
- consistent gutters,
- clear page boundaries.

Do not make every screen a stack of identical cards.

Use a mix of:
- open editorial sections,
- bordered work surfaces,
- dark image-preview stages,
- metric strips,
- compact tables,
- chart panels,
- clear form groups.

Mobile:
- collapse navigation cleanly,
- stack work areas in a meaningful order,
- keep all controls reachable,
- prevent horizontal scrolling,
- preserve preview visibility,
- make touch targets comfortable.

## 10.5 Signature visual language

Create a consistent design vocabulary that belongs to image processing:

- registration marks,
- fine alignment rules,
- image-frame corners,
- numbered process stages,
- small film/contact-sheet references,
- pixel-grid details,
- measured technical captions,
- restrained status stamps such as `AUTHENTICATED`, `CAPACITY`, `ANALYSIS`,
- dark image-preview panels,
- clear before/after image labels.

Use these elements sparingly. The interface must remain calm and readable, not look like a sci-fi movie dashboard.

## 10.6 Real visual content

The strongest visual element should be the user's actual image and real algorithm output.

Create custom visual components for:
- image preview,
- adaptive score-map heatmap,
- edge-map preview,
- cover/stego comparison slider,
- pixel difference heatmap,
- histogram.

Render actual image-analysis data. A synthetic decorative image may be used only as a clearly labelled empty-state demonstration. Never imply it is an uploaded user image or a real benchmark result.

## 10.7 Motion and interaction

Use subtle, purposeful transitions:
- 120–220 ms for hover/focus/state transitions,
- progress indication for real processing,
- restrained entry transitions,
- no looping motion without a functional reason.

Respect `prefers-reduced-motion`.

No animation may delay core interactions or disguise processing failures.

## 10.8 Component styling

Buttons:
- one strong primary style,
- clear secondary and quiet actions,
- obvious disabled and loading states,
- consistent height and focus treatment.

Inputs:
- visible labels,
- helpful descriptions,
- strong focus ring,
- clear validation messages,
- password visibility toggle.

Cards/panels:
- use only when content grouping benefits,
- avoid nested-card overload,
- use borders and spacing before shadows.

Tables:
- readable density,
- aligned numeric columns,
- tabular figures,
- sticky header only when useful,
- mobile overflow handled intentionally.

Charts:
- restrained palette,
- visible axes/units,
- direct labels,
- gridlines only where useful,
- no 3D,
- no decorative charts without a measurement.

Icons:
- use Lucide icons with a consistent stroke weight,
- never mix arbitrary icon families,
- never use emoji as substitutes.

## 10.9 Accessibility

Target WCAG 2.2 AA where applicable:
- normal text contrast at least 4.5:1,
- large text contrast at least 3:1,
- keyboard-accessible navigation and controls,
- visible focus states,
- semantic HTML,
- accessible names and descriptions,
- form errors announced clearly,
- status updates announced with appropriate live regions,
- meaningful alt text,
- no color-only status communication,
- usable at 200% zoom,
- respect reduced motion.

Do not treat accessibility as a final cosmetic pass.

## 10.10 Visual QA

Run the application and inspect it at:
- desktop: 1440 × 900,
- laptop: 1280 × 800,
- tablet: approximately 768 px wide,
- mobile: 390 × 844.

Inspect at least:
- Overview,
- Encode,
- Decode,
- Analysis,
- Benchmark.

Fix:
- clipping,
- inconsistent spacing,
- poor hierarchy,
- excessive empty space,
- overcrowded cards,
- text overflow,
- broken responsive layouts,
- inconsistent controls,
- visual mismatch between pages.

Take screenshots for the project documentation if tooling permits.

---

# 11. FRONTEND STRUCTURE AND BEHAVIOR

Use a maintainable structure similar to:

```text
frontend/
  public/
  src/
    app/
    components/
      layout/
      forms/
      images/
      charts/
      metrics/
      feedback/
    features/
      encode/
      decode/
      analysis/
      benchmark/
      methodology/
    hooks/
    lib/
    services/
    styles/
    types/
    App.tsx
    main.tsx
  tests/
  index.html
  package.json
  vite.config.ts
  tsconfig.json
```

The exact names can vary, but responsibilities must remain separated.

## 11.1 Frontend engineering rules

- Strict TypeScript; avoid `any`.
- Centralize API calls in a typed service layer.
- Centralize response/error parsing.
- Validate client form state, but never rely on client validation alone.
- Use object URLs safely and revoke them when no longer required.
- Show loading, empty, success and error states.
- Do not hide failed API calls.
- Disable duplicate submissions while a request is running.
- Prevent stale results from being shown after the user changes input.
- Do not put passwords or payload content into localStorage, sessionStorage, URLs or analytics.
- Do not retain sensitive state longer than needed.
- Clear sensitive inputs after successful completion and on explicit reset.
- Use accessible dialogs, tabs, menus and upload controls.

## 11.2 API integration

Use a configurable API base URL:

- development: Vite proxy to local FastAPI,
- production: `VITE_API_BASE_URL` supplied by deployment configuration.

Never hard-code localhost in production.

Use typed TypeScript response models.

---

# 12. BACKEND STRUCTURE AND API CONTRACT

Use a clear structure similar to:

```text
backend/
  app/
    main.py
    config.py
    api/
      health.py
      capacity.py
      encode.py
      decode.py
      analysis.py
      benchmark.py
    core/
      crypto.py
      kdf.py
      key_schedule.py
      integrity.py
      payload_format.py
      binary_utils.py
    stego/
      image_io.py
      feature_map.py
      adaptive.py
      permutation.py
      embedding.py
      extraction.py
      bootstrap.py
    analysis/
      quality.py
      histogram.py
      entropy.py
      statistics.py
      report.py
    schemas/
      requests.py
      responses.py
    services/
      encode_service.py
      decode_service.py
      benchmark_service.py
  tests/
  requirements.txt
  Dockerfile
```

## 12.1 Required routes

Use versioned REST endpoints under `/api/v1`.

### `GET /api/v1/health`

Return basic readiness and application version. Do not return secrets, environment variables or internal paths.

### `POST /api/v1/capacity`

Input:
- cover image,
- selected adaptive configuration.

Return:
- dimensions,
- format,
- usable payload capacity in bits and bytes,
- bootstrap/header overhead,
- adaptive allocation statistics,
- suitability summary,
- warnings.

This is an estimate until the exact encrypted package length is known.

### `POST /api/v1/encode`

Input:
- cover image,
- text or secret file,
- password,
- payload type,
- allowed adaptive configuration.

Return a ZIP archive containing:
- `stego.png`,
- `report.json`,
- a short `README.txt` explaining the output.

The report contains real metrics and non-secret algorithm settings. Do not include the password, derived key or plaintext in the report.

The frontend must unpack the ZIP in memory and provide separate downloads for the PNG and report.

### `POST /api/v1/decode`

Input:
- stego image,
- password.

On success, return a ZIP archive containing:
- recovered file or `recovered_message.txt`,
- `verification.json`.

Only construct the success archive after authentication and digest verification pass.

On failure, return a structured error response and no plaintext file.

### `POST /api/v1/analyze`

Input:
- cover image,
- stego image.

Return JSON with:
- validation result,
- dimensions,
- quality metrics,
- histogram data,
- entropy,
- changed-pixel metrics,
- edge density,
- analysis arrays or safely encoded preview maps where needed.

### `POST /api/v1/benchmark`

Input:
- cover image,
- one or more payload sizes or payloads,
- selected comparison methods.

Return actual per-method results and timings.

Validate payload sizes against method capacity.

## 12.2 API response consistency

Use Pydantic models for structured responses.

Use stable error shapes, for example:

```json
{
  "error": {
    "code": "INSUFFICIENT_CAPACITY",
    "message": "The selected carrier does not have enough adaptive capacity for this payload."
  }
}
```

Use appropriate HTTP status codes.

Do not return Python tracebacks to the browser.

Do not include stack traces, secrets, passwords or internal paths in production errors.

## 12.3 Temporary data and privacy

- Keep processing in memory where feasible.
- If temporary files are necessary, use isolated random paths.
- Clean all temporary material in `finally` blocks.
- Set request size and decoded-pixel limits.
- Do not store uploads as public static files.
- Do not log request bodies, passwords, payload text, ciphertext, derived keys or recovered files.
- Keep logs useful but non-sensitive.
- Return downloads with safe content-disposition filenames.

## 12.4 Upload validation

Follow defense-in-depth file-upload handling:
- allow-list supported image formats,
- validate actual decoded content,
- inspect image dimensions and frame count,
- do not trust the `Content-Type` header,
- do not trust the filename extension alone,
- set file-size limits,
- reject animated/multi-frame files unless fully supported,
- limit decoded pixels,
- normalize and sanitize filenames,
- avoid path traversal,
- catch malformed image/decompression errors.

## 12.5 CORS and deployment configuration

- Configure explicit production frontend origins.
- Do not use unrestricted `*` CORS with credentials.
- Use environment variables for allowed origins.
- Provide a safe local development origin.
- Configure correct HTTPS behavior in production.
- Do not add authentication middleware that the project does not need.

---

# 13. FAILURE STATES AND USER-FACING ERRORS

Create clear messages for:

| Condition | Expected behavior |
|---|---|
| Invalid image | Reject before processing |
| Unsupported/lossy format | Explain lossless carrier requirement |
| Oversized image | Explain configured size/pixel limit |
| Insufficient capacity | Show required and available capacity |
| Invalid bootstrap header | Reject as invalid/corrupt carrier |
| Unsupported version | Reject with version message |
| Wrong password | Authentication failure; no plaintext |
| Modified ciphertext | Authentication failure; no plaintext |
| Modified authenticated header | Authentication failure |
| SHA-256 mismatch | Integrity failure; no plaintext release |
| Corrupted image | Reject safely |
| Empty secret payload | Handle according to a documented policy |
| Missing password | Ask user to enter it before request |
| API unavailable | Show actionable retry guidance |
| Backend cold start | Show a clear connecting/waking state, not a fake success |
| Benchmark method failure | Mark that method failed; retain other valid results |

Do not reveal secret-dependent data through verbose error messages.

---

# 14. TESTING — NON-NEGOTIABLE

Create unit, integration and end-to-end tests.

## 14.1 Cryptography tests

- Argon2id produces a stable key for the same passphrase and salt.
- Different salts produce different keys.
- AES-GCM encrypt/decrypt round trip succeeds.
- Wrong password fails authentication.
- Modified ciphertext fails authentication.
- Modified AAD/header fails authentication.
- No hard-coded key or nonce exists.
- Nonce changes between independent encode operations.

## 14.2 Payload-format tests

- Text payload round trip.
- Binary file payload round trip.
- Unicode filename handling.
- Long but allowed filename.
- Invalid length fields rejected.
- Truncated package rejected.
- Malformed UTF-8 filename handled safely.
- Path traversal filename sanitized/rejected.

## 14.3 Adaptive-map tests

- Feature map output has expected shape and range.
- Flat image does not cause divide-by-zero.
- Gradient map is deterministic.
- Local variance map is deterministic.
- Canny output is deterministic for the same normalized image.
- Thresholds create valid 0/1/2-bit assignments.
- Header slots are excluded.
- Candidate capacity equals the sum of slot widths.
- The stable analysis image is identical before and after allowed LSB changes.
- The adaptive map is identical between cover and generated stego image.

## 14.4 Embedding/extraction tests

Mandatory:
- text encode → PNG save → reload → decode → exact text equality.
- file encode → PNG save → reload → decode → exact byte equality.
- same password succeeds.
- different password fails.
- tampering with an embedded-data pixel fails safely.
- tampering with a bootstrap header field is rejected.
- insufficient capacity is rejected before writing.
- header-only and boundary-size cases are tested.
- one-bit and two-bit slots are extracted correctly.
- partial final slot is extracted correctly.
- image dimensions and format are preserved appropriately.

## 14.5 Quality metric tests

- Identical images: MSE is 0.
- Identical images: PSNR is infinite/appropriately represented.
- Identical images: SSIM is approximately 1.
- Changed pixels produce positive MSE.
- SSIM receives the correct data range.
- RGB channel axis is configured correctly.
- Mismatched image dimensions are rejected.

## 14.6 API tests

- Health response.
- Valid capacity request.
- Encode response archive contents.
- Decode response archive contents.
- Wrong-password API response.
- Tampered-image API response.
- Oversized request.
- Invalid MIME/extension spoof.
- Invalid image bytes.
- CORS configuration.

## 14.7 End-to-end test

Run a complete real workflow through the application:
1. Open the web application.
2. Upload a sample lossless cover.
3. Enter a secret message.
4. Enter and confirm a password.
5. Calculate capacity.
6. Encode.
7. Download and inspect the stego PNG.
8. Open Decode.
9. Upload the saved stego PNG.
10. Enter the correct password.
11. Verify authentication and digest.
12. Confirm recovered text exactly matches the original.
13. Repeat with a wrong password.
14. Repeat with a tampered image.

## 14.8 Visual and accessibility tests

If browser tooling is available:
- take desktop and mobile screenshots,
- test navigation,
- test keyboard use,
- test upload controls,
- test password visibility,
- test empty, loading, success and error states,
- run automated accessibility checks where practical,
- fix visible layout defects.

---

# 15. BENCHMARK AND CAPSTONE EXPERIMENTS

Create a reproducible benchmark module and save actual results.

## 15.1 Test image categories

Support evaluation with:
- smooth/low-texture images,
- highly textured images,
- natural scenes,
- architectural/urban scenes,
- portrait-like images,
- synthetic patterned test images.

Do not label generated patterns as real photographic datasets.

Provide a script that generates a small deterministic synthetic test set using Pillow/NumPy. Clearly mark it as synthetic.

Where real test images are used, document the source, license and resolution.

## 15.2 Payload sizes

Test a range of sizes, for example:
- 128 bytes,
- 512 bytes,
- 1 KB,
- 2 KB,
- 5 KB,
- larger sizes only when the carrier capacity allows.

Skip sizes that exceed capacity and record the reason.

## 15.3 Record these fields

- experiment ID,
- carrier name,
- carrier dimensions,
- carrier format,
- method,
- payload bytes,
- total capacity bits,
- payload bits,
- capacity utilization,
- MSE,
- PSNR,
- SSIM,
- cover entropy,
- stego entropy,
- entropy difference,
- changed pixels,
- changed-pixel ratio,
- encode time,
- decode time,
- round-trip equality,
- authentication result,
- integrity result.

## 15.4 Benchmark output

Save:
- CSV,
- JSON,
- a readable Markdown report,
- comparison charts where possible.

Use real run results only.

If the benchmark has not been executed, clearly mark the report as pending rather than inventing results.

## 15.5 Scientific interpretation

Discuss the capacity–imperceptibility trade-off.

Do not guarantee that adaptive embedding always produces better PSNR/SSIM than every baseline. State the measured outcome for the tested dataset and parameter configuration.

---

# 16. DOCUMENTATION AND ACADEMIC HANDOVER

Generate documentation that matches the implementation.

Required files:

```text
README.md
docs/
  problem_statement.md
  objectives_and_scope.md
  system_architecture.md
  algorithm_and_mathematics.md
  cryptographic_design.md
  adaptive_embedding_method.md
  api_reference.md
  testing_and_validation.md
  experiment_protocol.md
  limitations_and_future_work.md
  viva_preparation.md
  references.md
```

## 16.1 README

Explain:
- exact project title,
- problem statement,
- objectives,
- key features,
- system architecture,
- technology stack,
- installation,
- environment variables,
- local run commands,
- test commands,
- benchmark commands,
- deployment instructions,
- known limitations.

## 16.2 Architecture documentation

Include:
- frontend/backend architecture,
- module responsibilities,
- API data flow,
- encryption pipeline,
- embedding pipeline,
- extraction pipeline,
- integrity verification.

Create Mermaid diagrams for:
- high-level system architecture,
- encoding flow,
- extraction flow,
- deployment architecture.

## 16.3 Algorithm documentation

Include:
- feature extraction equations,
- normalization,
- adaptive score equation,
- thresholds,
- candidate-slot construction,
- location permutation method,
- bit embedding rule,
- extraction rule,
- capacity equation,
- complexity discussion,
- algorithm versioning.

Explain why clearing the lower two bits before feature extraction makes the map reproducible.

## 16.4 Cryptographic documentation

Explain:
- Argon2id,
- salt,
- AES-256-GCM,
- nonce,
- authentication tag,
- AAD,
- key separation,
- SHA-256 payload digest,
- wrong-password behavior,
- tampering behavior.

Never include real passwords, keys or secrets.

## 16.5 Experiment documentation

Include:
- test image descriptions,
- payload sizes,
- method configurations,
- metric formulas,
- test environment,
- actual results,
- observations,
- limitations,
- reproducibility instructions.

Do not write conclusions before the experiments are run.

## 16.6 Viva preparation

Create a concise question-and-answer guide covering:
- what is steganography,
- how it differs from cryptography,
- why encrypt before embedding,
- why AES-GCM,
- why Argon2id,
- why SHA-256,
- why adaptive embedding,
- why edges and texture are considered,
- how the map is reproduced,
- what the bootstrap header contains,
- what PSNR means,
- why SSIM complements MSE,
- what capacity utilization means,
- why PNG is used,
- what happens with JPEG compression,
- what the limitations are,
- what the contribution of this project is.

Keep answers technically correct and explainable to a B.Tech student.

---

# 17. PROJECT REPOSITORY STRUCTURE

Use a clean monorepo structure similar to:

```text
secure-adaptive-steganography/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── app/
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── experiments/
│   ├── datasets/
│   ├── generated_samples/
│   ├── run_benchmarks.py
│   └── results/
│
├── docs/
│
├── scripts/
│   ├── dev.sh
│   ├── dev.ps1
│   ├── test.sh
│   └── generate_samples.py
│
├── .github/
│   └── workflows/
│
├── .gitignore
├── docker-compose.yml
├── render.yaml
├── README.md
└── LICENSE
```

You may adjust the exact structure, but do not mix cryptography, steganography, API transport, UI components and benchmarking into one giant file.

Add a suitable open-source license only if appropriate. If ownership/licensing is uncertain, use a simple project-specific notice or omit a license rather than assigning rights to someone else.

---

# 18. LOCAL DEVELOPMENT EXPERIENCE

Make the local startup process easy.

Provide:
- `.env.example`,
- dependency installation commands,
- one-command or clearly scripted development startup,
- separate backend/frontend startup commands,
- test commands,
- benchmark commands.

A preferred development experience is:

```bash
# Install backend requirements
cd backend
python -m venv .venv
# Activate the virtual environment using the correct OS command
pip install -r requirements.txt

# In another terminal
cd frontend
npm ci
npm run dev
```

Also create scripts or Docker Compose support so the complete application can be started with minimal effort.

Do not hard-code machine-specific absolute paths.

Make the scripts work on Windows PowerShell and Unix-like shells where practical.

Create a Docker Compose configuration for local full-stack testing. The application must still be usable without Docker.

---

# 19. DEPLOYMENT — COMPLETE THIS, NOT JUST DOCUMENT IT

Deployment is part of the deliverable.

## 19.1 Default deployment strategy

Use **Render** as the default single-provider deployment target when no existing authenticated hosting platform is clearly available.

Deploy two services from one repository using a Render Blueprint:

1. React/Vite frontend as a Render Static Site.
2. FastAPI backend as a Render Web Service.

Create and validate a root-level `render.yaml`.

The frontend must use the deployed API URL through `VITE_API_BASE_URL`.

The backend must allow only the exact deployed frontend origin through its CORS environment configuration.

Use service-to-service environment references when supported by the current Render Blueprint specification. Validate the actual configuration with the current provider documentation/CLI before attempting deployment.

Use the appropriate current build and start commands. A typical FastAPI start command is:

`uvicorn app.main:app --host 0.0.0.0 --port $PORT`

A typical Vite build writes the production files to `dist`. Deploy the `dist` directory as a static site.

Configure:
- health check,
- frontend SPA route fallback,
- production API base URL,
- exact CORS origins,
- secure response headers,
- automatic redeployment from the configured Git branch where supported.

## 19.2 Existing account and repository detection

Before choosing a deployment action:

1. Check whether the current project already has a Git remote.
2. Check whether GitHub CLI or an equivalent Git provider CLI is installed and authenticated.
3. Check whether Render CLI or an authenticated browser session is available.
4. Check whether a project-specific deployment configuration already exists.
5. Preserve valid existing deployment configuration rather than replacing it unnecessarily.

If an existing authenticated hosting provider is already configured for this repository and supports both the static frontend and Python backend cleanly, you may use it instead of creating duplicate infrastructure. Document the reason.

Otherwise use the Render strategy above.

## 19.3 Repository publishing

If no Git remote exists:
- check GitHub authentication,
- if authenticated, create a **private** repository with a sensible project name,
- add the remote,
- commit the project,
- push the deployment branch.

Never create a public repository by default.

Never push `.env`, secret files, passwords, API tokens, generated sensitive payloads, uploaded images or benchmark files containing private data.

If GitHub authentication is missing, prepare the repository locally and open/guide the official authentication process. Do not pretend the remote repository was created.

## 19.4 Hosting authentication

A hosting-provider account may be required to create real public deployment infrastructure.

- Prefer browser-based OAuth/sign-in when available.
- If the provider's CLI requires an access token, use its official secure authentication mechanism.
- Never place an access token in source code, `render.yaml`, README, Git history or this prompt.
- Never ask the user to paste a private token into this conversation.
- Do not store a deployment token in a committed `.env` file.
- Do not invent a token or claim authentication succeeded when it did not.

If authentication is unavailable, finish all local work, create `render.yaml`, validate it, write the deployment guide and report the exact account-authentication blocker. Do not describe this state as deployed.

## 19.5 Cost control

Do not purchase a domain.
Do not create a paid database.
Do not upgrade to a paid plan.
Do not activate paid add-ons.
Do not incur a charge without explicit user approval.

Prefer a currently available free/demo resource where technically suitable. Verify current plan limits before deployment. If the free tier cannot support the configured image size or workload, reduce the demo limits safely or explain the limitation. Never silently create a paid resource.

## 19.6 Deployment validation

After deployment:
1. Record the actual frontend URL.
2. Record the actual backend URL.
3. Open the frontend URL.
4. Test the backend health endpoint.
5. Verify that the frontend can reach the backend.
6. Test an actual encode/decode round trip against the deployed application.
7. Check CORS.
8. Check browser console and network errors.
9. Confirm that the deployed URLs use HTTPS.
10. Record the actual deployment state and any provider plan limitations.

Do not publish fake URLs.

## 19.7 Docker deployment fallback

Create a production-capable backend Dockerfile and local Docker Compose setup.

If Render deployment is blocked but Docker is available, verify the Docker build and run it locally. The project should remain deployable elsewhere without changing the core application code.

---

# 20. API KEYS AND EXTERNAL SERVICES — EXACT REQUIREMENT

**The application must not need an external AI API key or paid third-party API to work.**

Do not add:
- OpenAI API,
- Gemini API,
- Claude API,
- Hugging Face inference API,
- image-generation APIs,
- paid image-hosting API,
- analytics API,
- external database API,
- external encryption API.

All core work is performed by the local Python libraries and the application's own backend.

Expected configuration:

### Frontend

- `VITE_API_BASE_URL` — public URL of the FastAPI service. This is configuration, not a secret.

### Backend

- `APP_ENV`
- `ALLOWED_ORIGINS`
- `MAX_UPLOAD_MB`
- `MAX_IMAGE_PIXELS`
- versioned Argon2id parameters, if configured by environment.

There should be no application encryption key stored in `.env`: encryption keys are derived per operation from the user's passphrase and a fresh random salt.

There should be no database password because the project does not need a database.

### Deployment-only credentials

Git-provider or Render authentication may be needed to create and publish infrastructure. These credentials belong only to the deployment provider's secure authentication flow. They are not required by the running application and must never be committed.

Create a `.env.example` containing only non-secret configuration placeholders and clear comments. Do not include real credentials.

At the end, explicitly state:

- application API keys required: **none**;
- deployment login required: **only if the hosting/repository account is not already authenticated**;
- environment variables used: list the actual ones;
- paid services required: **none by default**.

---

# 21. SECURITY AND ENGINEERING HARDENING

Implement sensible protections appropriate for a student capstone deployment.

- Enforce request-size limits.
- Enforce decoded-pixel limits.
- Validate file signatures by decoding with a maintained library.
- Reject unsupported or malformed image files.
- Prevent path traversal and unsafe filenames.
- Do not expose server file paths.
- Do not return raw exception messages in production.
- Do not log passwords or payloads.
- Use HTTPS in deployment.
- Configure explicit CORS.
- Configure basic security headers where the host permits.
- Keep dependencies maintained and pinned.
- Run an available dependency vulnerability check.
- Keep temporary files isolated and clean them.
- Avoid serving uploaded files as public static assets.
- Use safe ZIP creation/extraction behavior.
- Prevent ZIP path traversal in the frontend archive parser by validating expected entries.
- Bound all lengths read from the bootstrap and inner payload.
- Avoid integer overflow in capacity and image-size calculations.
- Limit concurrent expensive tasks if needed for the selected hosting plan.
- Use a simple rate limit if practical, while documenting whether it is process-local or globally enforced.
- Do not imply that CORS is authentication.
- Do not imply that a public student demo is suitable for classified or high-security data.

Never make a security claim stronger than what has been implemented and tested.

---

# 22. LIMITATIONS — DOCUMENT HONESTLY

Document that this first version is a spatial-domain lossless-carrier implementation.

It is not designed to survive arbitrary transformations such as:
- JPEG compression,
- resizing,
- cropping,
- rotation,
- heavy filtering,
- color-space conversion,
- screenshotting,
- aggressive recompression.

The adaptive spatial method may improve imperceptibility in the tested conditions, but it is not guaranteed to defeat modern steganalysis.

The key-derived permutation is an additional extraction dependency, not a replacement for encryption.

The bootstrap header is intentionally readable so extraction can discover the algorithm version, salt, nonce and payload length. It contains no plaintext secret.

The system is a capstone research prototype, not a certified secure communication product.

Possible future work:
- DWT-domain embedding,
- DCT-domain embedding,
- transform-domain robustness evaluation,
- richer steganalysis,
- larger photographic datasets,
- learned/attention-based adaptive maps.

Do not implement these advanced methods at the cost of leaving the core system incomplete.

---

# 23. IMPLEMENTATION ORDER

Execute these phases in order. Do not stop for approval between phases.

## Phase A — Workspace and architecture
- Inspect repository and environment.
- Create monorepo.
- Set up frontend/backend dependencies.
- Add `.gitignore`, `.env.example`, Docker and local scripts.

## Phase B — Binary format and cryptography
- Implement Argon2id.
- Implement AES-256-GCM.
- Implement HKDF/key separation.
- Implement payload serialization.
- Implement fixed bootstrap header.
- Add unit tests.

## Phase C — Image processing
- Implement lossless image loading/validation.
- Implement stable upper-six-bit analysis representation.
- Implement Sobel, local variance and Canny.
- Implement normalized score map.
- Implement adaptive allocation.
- Implement candidate slot construction.
- Implement deterministic key-derived slot ordering.
- Add capacity calculation.
- Add determinism tests.

## Phase D — Embedding and extraction
- Implement fixed header embedding/extraction.
- Implement adaptive payload embedding.
- Implement adaptive extraction.
- Implement authenticated decryption.
- Implement digest verification.
- Add round-trip, wrong-key and tampering tests.

## Phase E — Metrics and experiments
- Implement MSE, PSNR, SSIM and additional metrics.
- Implement visual-analysis data.
- Implement baseline methods.
- Implement benchmark runner and CSV/JSON output.
- Run real experiments.

## Phase F — Backend API
- Implement FastAPI routes and schemas.
- Add upload validation and limits.
- Add error handling.
- Add CORS configuration.
- Add API tests.
- Verify API round trips.

## Phase G — Frontend and design system
- Establish tokens, typography, grid and component styles.
- Build application shell.
- Build Overview, Encode, Decode, Analysis, Benchmark and Methodology pages.
- Connect all real API flows.
- Implement responsive and accessible states.

## Phase H — Integration and visual QA
- Run backend and frontend together.
- Test all pages.
- Run end-to-end workflow.
- Inspect screenshots at desktop and mobile sizes.
- Fix design and functional defects.
- Run production build.

## Phase I — Documentation
- Write README and all required docs.
- Generate architecture diagrams.
- Generate viva guide.
- Include actual experiment output and limitations.

## Phase J — Deployment
- Inspect Git/hosting authentication.
- Create a private repository if possible and if none exists.
- Validate `render.yaml`.
- Deploy frontend and backend.
- Verify production health, CORS and one real encode/decode round trip.
- Record only real URLs and states.

## Phase K — Final audit
- Run all tests again.
- Check for secrets in tracked files and Git history.
- Check no fake results or TODO placeholders remain.
- Confirm startup commands.
- Confirm final deployment state.
- Prepare a concise handover.

---

# 24. FINAL ACCEPTANCE CHECKLIST

The project is complete only when the following checklist is satisfied or a genuine external blocker is explicitly recorded.

## Functionality
- [ ] Encode text
- [ ] Encode file
- [ ] Decode text
- [ ] Decode file
- [ ] Correct-password success
- [ ] Wrong-password rejection
- [ ] Tamper rejection
- [ ] Header validation
- [ ] Adaptive map reproducibility
- [ ] Capacity pre-check
- [ ] Lossless PNG output
- [ ] Real quality metrics
- [ ] Baseline comparison
- [ ] CSV/JSON export

## Security
- [ ] Argon2id key derivation
- [ ] Unique random salt
- [ ] AES-256-GCM
- [ ] Unique random nonce per encryption
- [ ] AAD header authentication
- [ ] SHA-256 payload digest check
- [ ] Key separation
- [ ] No hard-coded key
- [ ] No plaintext/password logs
- [ ] Upload validation
- [ ] Bounded image size
- [ ] Temporary data cleanup

## Design
- [ ] Custom art direction
- [ ] Custom typography system
- [ ] Custom design tokens
- [ ] Consistent grid
- [ ] No generic AI dashboard styling
- [ ] Real image/analysis visualizations
- [ ] Responsive desktop/tablet/mobile
- [ ] Visible focus states
- [ ] WCAG contrast checks
- [ ] Reduced-motion support
- [ ] Loading/empty/success/error states

## Quality
- [ ] Unit tests
- [ ] Integration/API tests
- [ ] End-to-end round trip
- [ ] Production frontend build
- [ ] No browser console errors
- [ ] No failing critical tests
- [ ] Actual benchmark files
- [ ] Documentation matches implementation

## Deployment
- [ ] Deployment configuration exists
- [ ] Deployment configuration validated
- [ ] Git repository pushed if authenticated
- [ ] Frontend deployed if authenticated
- [ ] Backend deployed if authenticated
- [ ] Health endpoint passes
- [ ] CORS passes
- [ ] HTTPS confirmed
- [ ] Production encode/decode verified
- [ ] Actual URLs recorded
- [ ] No unapproved paid resource created

---

# 25. REQUIRED FINAL HANDOVER FROM ANTIGRAVITY

When implementation is complete, provide a concise but factual handover with these headings:

1. **What was built** — list the working features.
2. **Architecture** — explain the frontend, API and processing modules.
3. **Cryptographic design** — state the real KDF, cipher, nonce, AAD and integrity checks.
4. **Adaptive embedding** — explain the actual feature map, allocation and reproducibility solution.
5. **UI and design** — summarize the implemented visual direction and responsive pages.
6. **Test results** — report exact commands and pass/fail counts from actual runs.
7. **Benchmark results** — summarize real result files; do not invent numbers.
8. **Run locally** — provide exact Windows PowerShell commands first, followed by Unix commands where useful.
9. **Deployment** — provide actual frontend/backend URLs and health-check result, or state the exact authentication blocker.
10. **API keys and credentials** — explicitly confirm that no application API keys are needed and list any deployment-only sign-in still required.
11. **Limitations** — list the real technical limitations.
12. **Where to find things** — point to the README, docs, tests and experiment outputs.

Do not mark any acceptance checklist item complete unless it has been verified.

---

# 26. RESEARCH AND IMPLEMENTATION REFERENCES

Use these primary/authoritative references as technical guidance. Verify current version-specific documentation when installing libraries or deploying.

## Cryptography and password-derived keys

- NIST SP 800-38D — Galois/Counter Mode (GCM), authenticated encryption:  
  https://csrc.nist.gov/pubs/sp/800/38/d/final
- RFC 9106 — Argon2 memory-hard function and parameter guidance:  
  https://www.rfc-editor.org/rfc/rfc9106
- OWASP Password Storage Cheat Sheet — Argon2id guidance and work factors:  
  https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- Python cryptography documentation:  
  https://cryptography.io/

## Image quality

- Wang, Bovik, Sheikh and Simoncelli, “Image Quality Assessment: From Error Visibility to Structural Similarity,” IEEE Transactions on Image Processing, 2004:  
  https://doi.org/10.1109/TIP.2003.819861
- scikit-image metrics documentation:  
  https://scikit-image.org/docs/stable/api/skimage.metrics.html
- OpenCV image-processing documentation:  
  https://docs.opencv.org/

## Upload security

- OWASP File Upload Cheat Sheet:  
  https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html

## UI engineering and accessibility

- shadcn/ui theming and semantic CSS-variable tokens:  
  https://ui.shadcn.com/docs/theming
- Radix UI accessibility primitives:  
  https://www.radix-ui.com/primitives/docs/overview/accessibility
- W3C WCAG 2.2:  
  https://www.w3.org/TR/WCAG22/

## Frontend and deployment

- Vite production/static deployment guidance:  
  https://vite.dev/guide/static-deploy
- Render Blueprint YAML specification:  
  https://render.com/docs/blueprint-spec
- Render FastAPI deployment guidance:  
  https://render.com/docs/deploy-fastapi
- Render Static Sites documentation:  
  https://render.com/docs/static-sites

Use these sources to support engineering decisions. Do not copy snippets without checking that they match the installed versions.

---

# 27. FINAL DIRECTIVE

You have everything needed to begin.

**Build the complete application in this workspace. Make the technical decisions. Make the design decisions. Implement the algorithms. Connect the frontend and backend. Validate the security behavior. Run the tests. Run the benchmarks. Write the documentation. Prepare deployment. Deploy it when authenticated access allows.**

Do not ask the student to create another prompt.

Do not ask the student to manually build any module.

Do not leave the user with a list of tasks that you could have completed.

The only acceptable reason to pause for user action is a genuine external authentication, permission or payment approval that cannot be completed by the agent itself.

**One workspace. This one instruction file. One complete capstone implementation.**

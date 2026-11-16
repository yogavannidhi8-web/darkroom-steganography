# Algorithm and Mathematical Foundations

## 1. Stable Analysis Invariant
To ensure that the embedding candidate map generated during decoding perfectly mirrors the map generated during encoding, we clear the lower 2 bits of all color channels prior to feature extraction:

$$\mathbf{I}_{\text{analysis}}(x, y, c) = \mathbf{I}(x, y, c) \ \& \ \text{0xFC}$$

Where $\mathbf{I}(x, y, c)$ is the pixel intensity of color channel $c \in \{R, G, B\}$. Since our embedding rule modifies at most the 2 lowest bits, we have:

$$\mathbf{I}_{\text{stego}}(x, y, c) \ \& \ \text{0xFC} \equiv \mathbf{I}_{\text{cover}}(x, y, c) \ \& \ \text{0xFC}$$

This guarantees mathematical identity between cover and stego analysis inputs.

---

## 2. Spatial Feature Extraction

### A. Luminance Conversion
Luminance $Y(x, y)$ is computed using the ITU-R BT.601 standard:
$$Y(x, y) = 0.299 \cdot R_{\text{analysis}} + 0.587 \cdot G_{\text{analysis}} + 0.114 \cdot B_{\text{analysis}}$$

### B. Sobel Gradient Magnitude
Horizontal and vertical gradients are computed with $3 \times 3$ Sobel operators:
$$G_x = \begin{bmatrix} -1 & 0 & +1 \\ -2 & 0 & +2 \\ -1 & 0 & +1 \end{bmatrix} * Y, \quad G_y = \begin{bmatrix} -1 & -2 & -1 \\ 0 & 0 & 0 \\ +1 & +2 & +1 \end{bmatrix} * Y$$
$$G_{\text{mag}}(x, y) = \sqrt{G_x(x, y)^2 + G_y(x, y)^2}$$

### C. Local Variance
Local variance within a $(2k+1) \times (2k+1)$ window (default $7 \times 7$) is computed using expectation values:
$$\text{Var}(x, y) = \mathbb{E}[Y^2] - (\mathbb{E}[Y])^2$$

### D. Canny Edge Detection
Binary edge indicator $E(x, y) \in \{0, 1\}$ is determined by non-maximum suppression of the gradient magnitude followed by hysteresis thresholding ($T_{\text{low}}=50, T_{\text{high}}=150$).

---

## 3. Composite Suitability Score
The normalized gradient and variance are computed via percentile clipping (1st to 99th percentile) to protect against outliers and zero-variance flat regions:
$$\bar{G}(x, y) = \text{clip}\left(\frac{G_{\text{mag}} - P_1(G)}{P_{99}(G) - P_1(G)}, 0, 1\right)$$
$$\bar{V}(x, y) = \text{clip}\left(\frac{\text{Var} - P_1(\text{Var})}{P_{99}(\text{Var}) - P_1(\text{Var})}, 0, 1\right)$$

The composite suitability score $S(x, y)$ is:
$$S(x, y) = w_1 \bar{G}(x, y) + w_2 \bar{V}(x, y) + w_3 E(x, y)$$
With weights $w_1 = 0.50$, $w_2 = 0.30$, and $w_3 = 0.20$.

---

## 4. Adaptive Bit Allocation
Bit allocation $B(x, y)$ per RGB channel follows three discrete bands:

$$B(x, y) = \begin{cases} 0 \text{ bits}, & S(x, y) < T_{\text{low}} \\ 1 \text{ bit}, & T_{\text{low}} \le S(x, y) < T_{\text{high}} \\ 2 \text{ bits}, & S(x, y) \ge T_{\text{high}} \end{cases}$$

For the balanced configuration: $T_{\text{low}} = 0.25$, $T_{\text{high}} = 0.55$.

---

## 5. Quantitative Distortion Metrics

### Mean Squared Error (MSE)
$$\text{MSE} = \frac{1}{3 W H} \sum_{x=1}^{W} \sum_{y=1}^{H} \sum_{c=1}^{3} \left(\mathbf{I}_{\text{cover}}(x, y, c) - \mathbf{I}_{\text{stego}}(x, y, c)\right)^2$$

### Peak Signal-to-Noise Ratio (PSNR)
$$\text{PSNR} = 10 \cdot \log_{10}\left(\frac{255^2}{\text{MSE}}\right) \quad [\text{dB}]$$
*(If $\text{MSE}=0$, $\text{PSNR}=\infty$)*

### Structural Similarity Index (SSIM)
$$\text{SSIM}(x, y) = \frac{(2\mu_x\mu_y + c_1)(2\sigma_{xy} + c_2)}{(\mu_x^2 + \mu_y^2 + c_1)(\sigma_x^2 + \sigma_y^2 + c_2)}$$
Where $c_1 = (k_1 L)^2, c_2 = (k_2 L)^2$ with $L=255, k_1=0.01, k_2=0.03$.

### Shannon Entropy
$$\mathcal{H} = -\sum_{i=0}^{255} p(i) \log_2 p(i)$$
Where $p(i)$ is the empirical probability of pixel intensity $i$.

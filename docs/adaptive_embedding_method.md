# Adaptive Embedding Method

## Motivation for Content-Adaptive Steganography
The human visual system (HVS) exhibits non-uniform sensitivity to luminance variations:
- **Low sensitivity in high-frequency regions:** Textures, foliage, fur, and sharp edges naturally conceal slight pixel variations.
- **High sensitivity in flat regions:** Smooth skies, skin surfaces, and flat backgrounds show noticeable noise even with 1-bit LSB substitution.

Our adaptive embedding method selectively concentrates payload bits into edge-rich, high-variance regions while preserving flat areas unmodified.

---

## Candidate Slot Construction
For each pixel $(x, y)$ in the carrier:
1. Determine bit allocation $B(x, y) \in \{0, 1, 2\}$ from the adaptive score map.
2. If $B(x, y) > 0$, construct candidate slots for each color channel $c \in \{R, G, B\}$.
3. Each candidate slot is represented as a tuple:
   $$\text{Slot} = (y, x, c, B(x, y))$$
4. **Header Reservation:** The first 512 channel positions (corresponding to the first $\lceil 512/3 \rceil = 171$ pixels) are reserved exclusively for the 64-byte bootstrap header (1 bit per channel) and are strictly excluded from the candidate slot list.

---

## Key-Dependent Slot Permutation
To avoid predictable sequential embedding traces, candidate slots are shuffled using the Fisher-Yates algorithm driven by a cryptographically secure pseudorandom keystream:

```python
keystream = ChaCha20(key=pos_key, nonce=zeros).encrypt(zeros(num_swaps * 4))
for i in range(n - 1, 0, -1):
    rand_val = unpack(">I", keystream[swap_idx*4 : (swap_idx+1)*4])[0]
    j = rand_val % (i + 1)
    slots[i], slots[j] = slots[j], slots[i]
```

This guarantees:
1. Every candidate slot has uniform probability of selection.
2. The sequence is completely deterministic given $\mathbf{K}_{\text{pos}}$ and the image dimensions.
3. Without the password, an attacker cannot predict the sequence of embedding slots.

---

## Embedding and Extraction Operations

### 1-Bit Slot Embedding
$$\text{Channel}' = (\text{Channel} \ \& \ \text{0xFE}) \ | \ b_0$$

### 2-Bit Slot Embedding
$$\text{Channel}' = (\text{Channel} \ \& \ \text{0xFC}) \ | \ (b_1 \ll 1) \ | \ b_0$$

### Extraction
- 1-Bit slot: $b_0 = \text{Channel}' \ \& \ 1$
- 2-Bit slot: $b_1 = (\text{Channel}' \gg 1) \ \& \ 1, \quad b_0 = \text{Channel}' \ \& \ 1$

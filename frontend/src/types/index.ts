export interface HealthResponse {
  status: string;
  version: string;
  environment: string;
}

export interface CapacityResponse {
  width: number;
  height: number;
  format: string;
  total_pixels: number;
  total_channels: number;
  header_channels: number;
  usable_capacity_bits: number;
  usable_capacity_bytes: number;
  zero_bit_pixels: number;
  one_bit_pixels: number;
  two_bit_pixels: number;
  adaptive_config_name: string;
  warnings: string[];
}

export interface QualityMetrics {
  image_dimensions: { width: number; height: number };
  mse: number;
  psnr: number | null;
  psnr_display: string;
  ssim: number;
  cover_entropy: number;
  stego_entropy: number;
  entropy_difference: number;
  changed_pixels: number;
  changed_pixels_ratio: number;
  changed_channels: number;
  changed_channels_ratio: number;
  total_pixels: number;
  total_channels: number;
  cover_edge_density: number;
  stego_edge_density: number;
  cover_rgb_histograms: { r: number[]; g: number[]; b: number[] };
  stego_rgb_histograms: { r: number[]; g: number[]; b: number[] };
  capacity_bits: number;
  payload_bits: number;
  capacity_bytes: number;
  payload_bytes: number;
  capacity_utilization: number;
  encode_time_seconds: number;
}

export interface EncodeReport {
  version: string;
  algorithm: string;
  embed_algo: string;
  adaptive_config_id: number;
  adaptive_config_name: string;
  kdf: string;
  cipher: string;
  integrity: string;
  carrier_format: string;
  carrier_dimensions: { width: number; height: number };
  payload_type: string;
  payload_bytes: number;
  encrypted_package_bytes: number;
  total_capacity_bits: number;
  payload_bits: number;
  quality_metrics: QualityMetrics;
}

export interface VerificationReport {
  header_valid: boolean;
  header_magic_ok: boolean;
  header_crc_ok: boolean;
  dimension_match: boolean;
  gcm_authenticated: boolean;
  sha256_digest_verified: boolean;
  sha256_digest_hex: string;
  payload_type: string;
  filename: string;
  payload_bytes: number;
  decode_time_seconds: number;
  algorithm: string;
  kdf: string;
  cipher: string;
}

export interface AnalysisResponse extends QualityMetrics {
  difference_heatmap_png_b64: string;
  score_map_png_b64: string;
  edge_map_png_b64: string;
  cover_format: string;
  stego_format: string;
}

export interface BenchmarkResult {
  method: string;
  payload_bytes: number;
  carrier_format: string;
  width: number;
  height: number;
  capacity_bits?: number;
  payload_bits?: number;
  capacity_utilization?: number;
  mse?: number;
  psnr?: number | null;
  ssim?: number;
  cover_entropy?: number;
  stego_entropy?: number;
  entropy_difference?: number;
  changed_pixels?: number;
  changed_pixels_ratio?: number;
  encode_time?: number;
  decode_time?: number;
  round_trip_ok?: boolean;
  authentication_ok?: boolean;
  integrity_ok?: boolean;
  status: 'success' | 'failed';
  error?: string;
}

export type ProcessingStage =
  | 'idle'
  | 'uploading'
  | 'validating'
  | 'analyzing'
  | 'encrypting'
  | 'embedding'
  | 'calculating'
  | 'completed'
  | 'extracting'
  | 'verifying'
  | 'failed';

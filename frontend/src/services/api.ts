const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = RAW_API_BASE.replace(/\/+$/, '');

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const json = await response.json();
      if (json?.error?.message) {
        errorMessage = json.error.message;
      } else if (json?.detail) {
        if (Array.isArray(json.detail)) {
          errorMessage = json.detail.map((d: any) => d.msg).join(', ');
        } else {
          errorMessage = typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail);
        }
      }
    } catch {
      // Not JSON
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

export const api = {
  async health() {
    const res = await fetch(`${API_BASE}/api/v1/health`);
    return handleResponse<{ status: string; version: string; environment: string }>(res);
  },

  async getCapacity(coverFile: File, adaptiveConfigId: number = 2) {
    const form = new FormData();
    form.append('cover', coverFile);
    form.append('adaptive_config_id', adaptiveConfigId.toString());
    const res = await fetch(`${API_BASE}/api/v1/capacity`, { method: 'POST', body: form });
    return handleResponse<import('../types').CapacityResponse>(res);
  },

  async encode(params: {
    coverFile: File;
    payloadType: 'text' | 'file';
    textPayload?: string;
    filePayload?: File;
    password: string;
    adaptiveConfigId: number;
  }): Promise<Blob> {
    const form = new FormData();
    form.append('cover', params.coverFile);
    form.append('payload_type', params.payloadType);
    form.append('password', params.password);
    form.append('adaptive_config_id', params.adaptiveConfigId.toString());
    if (params.payloadType === 'text' && params.textPayload) {
      form.append('text_payload', params.textPayload);
    }
    if (params.payloadType === 'file' && params.filePayload) {
      form.append('file_payload', params.filePayload);
    }
    const res = await fetch(`${API_BASE}/api/v1/encode`, { method: 'POST', body: form });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        msg = j?.error?.message || j?.detail || msg;
        if (typeof msg === 'object') msg = JSON.stringify(msg);
      } catch {}
      throw new Error(msg);
    }
    return res.blob();
  },

  async decode(stegoFile: File, password: string): Promise<Blob> {
    const form = new FormData();
    form.append('stego', stegoFile);
    form.append('password', password);
    const res = await fetch(`${API_BASE}/api/v1/decode`, { method: 'POST', body: form });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        msg = j?.error?.message || j?.detail || msg;
        if (typeof msg === 'object') msg = JSON.stringify(msg);
      } catch {}
      throw new Error(msg);
    }
    return res.blob();
  },

  async analyze(coverFile: File, stegoFile: File, adaptiveConfigId: number = 2) {
    const form = new FormData();
    form.append('cover', coverFile);
    form.append('stego', stegoFile);
    const res = await fetch(`${API_BASE}/api/v1/analyze?adaptive_config_id=${adaptiveConfigId}`, {
      method: 'POST',
      body: form,
    });
    return handleResponse<import('../types').AnalysisResponse>(res);
  },

  async benchmark(params: {
    coverFile: File;
    payloadSizes: number[];
    methods: string[];
    password?: string;
  }) {
    const form = new FormData();
    form.append('cover', params.coverFile);
    form.append('payload_sizes_json', JSON.stringify(params.payloadSizes.map(String)));
    form.append('methods', params.methods.join(','));
    if (params.password) form.append('password', params.password);
    const res = await fetch(`${API_BASE}/api/v1/benchmark`, { method: 'POST', body: form });
    return handleResponse<{ results: import('../types').BenchmarkResult[] }>(res);
  },
};

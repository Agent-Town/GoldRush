const BASE64_CHUNK_BYTES = 0x8000;

export async function gzipTextBase64(text: string): Promise<string> {
  const source = new Response(new TextEncoder().encode(text)).body;
  if (!source) throw new Error('gzip_encode_failed');
  const compressed = await new Response(source.pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
  return bytesBase64(new Uint8Array(compressed));
}

export async function gunzipJsonBase64(value: string, maxOutputBytes: number): Promise<unknown> {
  const bytes = base64Bytes(value);
  const source = new Response(arrayBufferCopy(bytes)).body;
  if (!source) throw new Error('gzip_decode_failed');
  const reader = source.pipeThrough(new DecompressionStream('gzip')).getReader();
  const chunks: Uint8Array[] = [];
  let outputBytes = 0;
  try {
    while (true) {
      const { done, value: chunk } = await reader.read();
      if (done) break;
      outputBytes += chunk.byteLength;
      if (outputBytes > maxOutputBytes) {
        await reader.cancel('gzip_output_too_large');
        throw new Error('gzip_output_too_large');
      }
      chunks.push(chunk);
    }
  } finally {
    reader.releaseLock();
  }
  const output = new Uint8Array(outputBytes);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(output));
}

function bytesBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += BASE64_CHUNK_BYTES) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + BASE64_CHUNK_BYTES));
  }
  return btoa(binary);
}

function base64Bytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function arrayBufferCopy(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

/**
 * Prepare a payload for sumbission to the API. Undefined values will be removed
 * and parameters can be mapped to different keys.
 * @param params The parameters to clean.
 * @param mapping A collection of key names to remap.
 */
export const generatePayloadParams = <P extends { [x: string]: unknown }>(
  params: P,
  mapping: { [x: string]: string } = {}
): { [x: string]: unknown } => {
  const payload: { [x: string]: unknown } = {};
  Object.entries(params).forEach(([key, value]) => {
    if (key in mapping) {
      // if the payload should use a different key then update it.
      key = mapping[key];
    }
    // Don't include any undefined values.
    if (typeof value !== "undefined") {
      payload[key] = value;
    }
  });
  return payload;
};

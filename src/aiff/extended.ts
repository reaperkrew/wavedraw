// IEEE 754 80-bit extended precision decode, used by the AIFF COMM chunk to
// store the sample rate. Sample rates are always small integers, so the BigInt
// intermediate keeps the result exact for every real-world value.
export function readExtended(view: DataView, offset: number): number {
  const high = view.getUint16(offset, false);
  const exponent = (high & 0x7fff) - 16383 - 63;
  const mantissa = view.getBigUint64(offset + 2, false);
  if (mantissa === 0n) {
    return 0;
  }
  const sign = high & 0x8000 ? -1 : 1;
  return sign * scaleMantissa(mantissa, exponent);
}

export function scaleMantissa(mantissa: bigint, exponent: number): number {
  if (exponent >= 0) {
    return Number(mantissa << BigInt(exponent));
  }
  const shift = BigInt(-exponent);
  const integer = mantissa >> shift;
  const fraction = mantissa & (1n << shift) - 1n;
  return Number(integer) + Number(fraction) / 2 ** -exponent;
}

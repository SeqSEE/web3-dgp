export const parseFromIntString = function (
  intString: string,
  precision: number
) {
  const length = intString.length;
  let integers = '0';
  let decimals = '0';
  if (length > precision) {
    integers = intString.substring(0, length - precision);
    decimals = intString.substring(length - precision, length);
  } else {
    integers = '0';
    decimals = '';
    for (let i = 0; i < precision; i++) {
      if (i <= length - 1) {
        decimals += intString.substring(i, i + 1);
      } else {
        decimals = '0' + decimals;
      }
    }
  }
  return `${integers}.${decimals}`;
};

export const toSatoshi = (amt: string | number) => {
  const split = `${amt}`.split('.');
  let decimals = ['0', '0', '0', '0', '0', '0', '0', '0'];
  if (split.length == 2) {
    for (let i = 0; i < 8; i++) {
      if (split[1].length > i) {
        decimals[i] = split[1][i];
      }
    }
  }
  return `${split[0]}${decimals.join('')}`;
};

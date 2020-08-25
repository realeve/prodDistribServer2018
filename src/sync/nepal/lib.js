const R = require("ramda");

let alphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
let alphaLowercase = alphas.map((item) => item.toLowerCase());
let arrs = [...alphaLowercase, ...alphas].filter(
  (item) => !["O", "o", "I", "l"].includes(item)
);

let orderIdx = {};
arrs.forEach((key, idx) => {
  orderIdx[key] = idx + 1;
});

const startPrefixCode = "B82000001";
/**
 *
 * @param str 印码号
 * @returns 箱号
 */
const calcCaseNo = (str) => {
  // 起始号
  let start = startPrefixCode;
  let strStart = start.substr(0, start.length - 3);
  let strEnd = str.substr(0, str.length - 3);

  // 字母
  let alpha = {
    start: strStart[0],
    end: strEnd[0],
  };

  let order = {
    start: orderIdx[alpha.start],
    end: orderIdx[alpha.end],
  };

  // 包号
  let packageNum = {
    start: strStart.slice(1),
    end: strEnd.slice(1),
  };

  // 1个字母中包含以下数量
  let iAlpha = 100000;
  let packages = (order.end - order.start) * iAlpha;

  let packageIdx = packages + Number(packageNum.end) - Number(packageNum.start);

  let caseNo = Math.floor(packageIdx / 50);
  if (str.slice(-4) > "0000") {
    caseNo += 1;
  }

  return `C.N.P. ${String(caseNo).padStart(3, "0")}`;
};

const calEWMCaseNo = (str) => {
  let prefix = str.replace(/\d.*/, "");
  let num =
    prefix === "B"
      ? Number(str.replace(/\D*/, "")) - 82000001
      : Number(str.replace(/\D*/, "")) - 1000000;
  return Math.floor(num / 50000) + 1;
};

/**
 * 计算结束号码
 * @param from 当前起始号码
 * @param printNum 打印张数
 */
const calcEnd = (from, printNum = 350) => {
  let to = printNum * 1000 + Number(from) - 1;
  return String(to).padStart(6, "0");
};

/**
 * 获取下一个字母
 * @param str 当前字母
 */
let getNextStr = (str) => {
  let idx = orderIdx[str] + 1;
  let res = Object.entries(orderIdx).find((item) => item[1] == idx);
  if (!res) {
    return "";
  }
  return res[0];
};

/**
 * 获取号码的冠字+后续6位数字
 * @param alpha 首字母
 * @param iFrom 号码部分
 */
const getCode = (alpha, iFrom, alpha2) => {
  let strFrom = String(iFrom);
  let res = { head: "", str: "" };
  if (iFrom >= 101000000) {
    // 获取下一个字符
    res.head = (alpha2 || getNextStr(alpha)) + strFrom[2];
  } else if (iFrom >= 100000000) {
    res.head = alpha + strFrom.slice(0, 3);
  } else if (iFrom < 10000000) {
    res.head = alpha + strFrom.slice(0, 1);
  } else {
    res.head = alpha + strFrom.slice(0, 2);
  }
  res.str = String(iFrom % 101000000).padStart(6, "0");
  res.str = res.str.slice(res.str.length - 6);
  if (res.str === "000000") {
    res.str = "999999";
  }
  return res;
};

/**
 * 获取一组箱签/千封签
 * @param from 起号
 * @param printNum 打印张数
 * @param head 冠字号
 * @param step 步长，默认1000；当为打印封箱签时设为50000
 */
module.exports.calcArr = (
  from,
  printNum,
  { gz: head, gz2: head2 },
  step = 1000
) => {
  let alpha = head[0];
  from = from.padStart(6, "0");

  let iFrom = Number(head.slice(1) + from);

  let arr = [];

  head2 = head2 || head;
  let alpha2 = head2[0];
  for (let i = 1; i <= printNum; i++) {
    let iEnd = iFrom + i * step - 1;
    let { head, str } = getCode(alpha, iEnd - step + 1, alpha2);
    let { str: to } = getCode(alpha, iEnd, alpha2);
    arr.push({
      head,
      from: str,
      to,
      caseNo: calcCaseNo(head + str),
      ewmCaseNo: calEWMCaseNo(head + str),
    });
  }

  return arr;
};

module.exports.getMultiRows = ({
  action,
  info: { gz, from, to, quantity },
}) => {
  if (from < 1 || quantity < 1 || from + quantity - 1 !== to) {
    throw new Error("起号、止号与数量的关系错误。");
  }
  if (R.isEmpty(gz)) {
    throw new Error("缺少冠字。");
  }

  return {
    PZ: "NRB10",
    GZ: gz,
    CZ: action,
    XH_START: from,
    XH_END: to,
  };
};

module.exports.handleData = (res) =>
  R.map(({ from, to, event_id }) => {
    let gz = from.slice(0, -6);
    let gz2 = to.slice(0, -6);
    from = from.replace(/[A-Z]/g, "");
    to = to.replace(/[A-Z]/g, "");
    return {
      str: { gz, gz2 },
      from: from.slice(-6),
      to: to.slice(-6),
      event_id,
    };
  }, res.data);

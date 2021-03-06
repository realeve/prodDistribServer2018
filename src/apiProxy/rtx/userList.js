const users = require("../../util/rtx");

let procList0 = ["胶一印", "胶二印", "胶印"];
let procList1 = ["凹一印", "凹二印", "凹印"];
let procList2 = ["印码", "丝印"];
let procList3 = ["裁封", "抽查", "检封", "裁切"];
let procList = [...procList0, ...procList1, ...procList2, ...procList3];

let userList = [
  {
    rtxInfo: [
      {
        dept_name: "胶凹制作部",
        userList: ["杨畅"]
      },
      {
        dept_name: "印钞管理部",
        userList: ["徐东海", "李宾", "李超群", "蒲明玥"]
      },
      {
        dept_name: "企划信息部",
        userList: ["倪震"]
      }
    ],
    proc_name: procList0
  },
  {
    rtxInfo: [
      {
        dept_name: "胶凹制作部",
        userList: ["李丹"]
      },
      {
        dept_name: "印钞管理部",
        userList: ["陈文革", "李宾", "李超群", "蒲明玥", "舒粤"]
      },
      {
        dept_name: "企划信息部",
        userList: ["倪震"]
      }
    ],
    proc_name: procList1
  },
  {
    rtxInfo: [
      {
        dept_name: "印码制作部",
        userList: ["汪雄", "袁长虹", "周海兵"]
      },
      {
        dept_name: "印钞管理部",
        userList: [
          "李宾",
          "钟鸣",
          "舒粤",
          "马可",
          "徐闵",
          "张立力",
          "朱振华",
          "潘成",
          "印码机检组"
        ]
      },
      {
        dept_name: "企划信息部",
        userList: ["倪震"]
      }
    ],
    proc_name: procList2
  },
  {
    rtxInfo: [
      {
        dept_name: "检封制作部",
        userList: ["吕从飞"]
      },
      {
        dept_name: "印钞管理部",
        userList: [
          "李宾",
          "袁长虹",
          "杨林",
          "胡新玥",
          "任礼科",
          "蒋荣",
          "冯诗伟",
          "印码机检组",
          "舒粤",
          "武明凯"
        ]
      },
      {
        dept_name: "企划信息部",
        userList: ["倪震"]
      }
    ],
    proc_name: procList3
  }
];

module.exports = {
  userList,
  procList,
  users
};

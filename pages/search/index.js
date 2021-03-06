const API = require("../../Apl/apl");

Page({
  data: {
    hotsongs: [], //获取热门搜索
    inputValue: null, //输入框输入的值
    history: [], //搜索历史存放数组
    searchsuggest: [], //搜索建议
    showView: true, //组件的显示与隐藏
    showsongresult: true,
    searchresult: [], //搜索结果
    searchKey: [],
  },

  onLoad() {
    this.gethotsongs(); //加载页面完成调用gethotsongs方法
  },

  // 从接口到获取到数据导入到hotsongs
  async gethotsongs() {
    wx.showLoading({
      title: "加载中",
    });
    try {
      const { result } = await API.gethotsongs({ type: "new" });
      this.setData({
        hotsongs: result.hots,
      });
      wx.hideLoading();
    } catch (error) {
      // no
    }
  },

  // 搜索建议
  async searchSuggest() {
    const data = await API.searchSuggest({
      keywords: this.data.searchKey,
      type: "mobile",
    });
    if (data.code === 200) {
      this.setData({
        searchsuggest: data.result.allMatch,
      });
    }
  },

  // 实现点击输入框的×把输入的内容清空
  clearInput: function (res) {
    this.setData({
      inputValue: "",
    });
  },

  //实现取消功能，停止搜索，返回首页
  cancel: function () {
    const url = "/pages/index/index";
    wx.switchTab({ url });
  },

  //获取input文本并且实时搜索,动态隐藏组件
  getsearchKey: function (e) {
    let that = this;
    if (e.detail.cursor != that.data.cursor) {
      //实时获取输入框的值
      that.setData({
        searchKey: e.detail.value,
      });
    }
    if (e.value != "") {
      //组件的显示与隐藏
      that.setData({
        showView: false,
      });
    } else {
      that.setData({
        showView: "",
      });
    }
    if (e.detail.value != "") {
      //解决 如果输入框的值为空时，传值给搜索建议，会报错的bug
      that.searchSuggest();
    }
  },

  // 清空page对象data的history数组 重置缓存为[]
  clearHistory: function () {
    const that = this;
    wx.showModal({
      content: "确认清空全部历史记录",
      cancelColor: "#DE655C",
      confirmColor: "#DE655C",
    }).then((res) => {
      if (res.confirm) {
        that.setData({
          history: [],
        });
        wx.setStorageSync("history", []); //把空数组给history,即清空历史记录
      } else if (res.cancel) {
      }
    });
  },

  // input失去焦点函数
  routeSearchResPage: function (e) {
    if (e.detail.value === "") return false;
    let history = wx.getStorageSync("history") || [];
    history.push(this.data.searchKey);
    wx.setStorageSync("history", history);
  },

  //每次显示变动就去获取缓存，给history，并for出来。
  onShow: function () {
    this.setData({
      history: wx.getStorageSync("history") || [],
    });
  },

  // 搜索结果
  async searchResult() {
    console.log(this.data.searchKey);
    const data = await API.searchResult({
      keywords: this.data.searchKey,
      type: 1,
      limit: 100,
      offset: 2,
    });
    if (data.code === 200) {
      this.setData({
        searchresult: data.result.songs,
      });
    }
  },

  // 搜索完成点击确认
  searchover: function (e) {
    let that = this;
    const value = e.detail.value;
    if (value === "") return false;
    that.setData({
      showsongresult: false,
    });
    that.searchResult();
  },

  handlePlayAudio: function (event) {
    //event 对象，自带，点击事件后触发，event有type,target，timeStamp，currentTarget属性
    const audioId = event.currentTarget.dataset.id; //获取到event里面的歌曲id赋值给audioId
    const url = `/pages/play/index?id=${audioId}`;
    //获取到id带着完整url后跳转到play页面
    wx.navigateTo({ url });
  },

  // 点击热门搜索值或搜索历史，填入搜索框
  fill_value: function (e) {
    let that = this;
    that.setData({
      searchKey: e.currentTarget.dataset.value, //点击吧=把值给searchKey,让他去搜索
      inputValue: e.currentTarget.dataset.value, //在输入框显示内容
      showView: false, //给false值，隐藏 热搜和历史 界面
      showsongresult: false, //给false值，隐藏搜索建议页面
    });
    that.searchResult(); //执行搜索功能
  },
});

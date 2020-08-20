// miniprogram/pages/index/index.js

const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    current:'time',
    listData:[],
    imgUrls:[]
  },

  getBannerList(){
    db.collection('banner').get().then((res)=>{
      this.setData({
        imgUrls:res.data
      })
    })
  },

  handleDetail(ev){
    let id = ev.target.dataset.id;
    wx.navigateTo({
      url: 'detail/detail?userId='+id,
    })
  },

  getList(){
    //更新列表
    db.collection("users").field({
      _id: true,
      userPhoto:true,
      nickName:true,
      links:true
    }).orderBy(this.data.current,"desc").get().then((res)=>{
      this.setData({
        listData : res.data
      })
    })
  },

  onPullDownRefresh:function() {
    //下拉刷新
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getList()
    //模拟加载
    setTimeout(function(){
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
    },1500);
  },

  handleCurrent(ev){
    //点击tab
    let current = ev.target.dataset.current;
    if (current ==  this.data.current) {
      return false;
    }
    this.setData({
      current
    },()=>{
      this.getList();
    })
  },

  handleLinks(ev){
    //点赞
    let id = ev.target.dataset.id;
    wx.cloud.callFunction({
      name : 'update',
      data : {
        collection : 'users',
        doc: id,
        data : "{links : _.inc(1)}"
         //封装自增语句
      }
    }).then((res)=>{
      let updated = res.result.stats.updated;
      if (updated){
        let cloneListData = [...this.data.listData];
        // let cloneListData = Object.assign( cloneListData, this.data.listData)
        for (let i = 0; i < cloneListData.length;i++){
          if (cloneListData[i]._id == id ){
            cloneListData[i].links++;
          }
        }
        this.setData({
          listData : cloneListData
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getList();
    this.getBannerList();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
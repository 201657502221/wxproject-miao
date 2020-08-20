// miniprogram/pages/near/near.js

const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude:"",
    longitude:"",
    markers: [{
      height: 50,
      iconPath: "https://wx.qlogo.cn/mmopen/vi_32/gIgdOhLgSpWwN64ibSM9P5a5oapx9eSO0MMHKico8UQaZf8My2uLwEp2icHO0m5Arsm9XWNJN6eqxFUciaqLE7bcHA/132",
      id: "3adec2825f339ddb00917b786c7f11e7",
      latitude: 35.10465,
      longitude: 118.35646,
      width: 50,
    }],
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
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getLocation()
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

  },
  
  getLocation(){
    wx.getLocation({
      type: 'gcj02',
      success: (res)=> {
        const latitude = res.latitude
        const longitude = res.longitude
        const speed = res.speed
        const accuracy = res.accuracy
        this.setData({
          latitude,
          longitude
        })
        this.getNearUsers()
      }
     })
  },
  getNearUsers(){
    db.collection('users').where({    //判断距离和是否开启位置共享
      location: _.geoNear({
        geometry: db.Geo.Point(this.data.longitude, this.data.latitude),
        minDistance: 0,
        maxDistance: 5000,
      }),
      isLocation:true
    }).field({
      longitude:true,
      latitude:true,
      userPhoto:true
    }).get().then((res)=>{
      let data = res.data;
      let result = [];
      if (data.length) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].userPhoto.includes('cloud://')) {

            wx.cloud.getTempFileURL({     //获取存储中头像的临时网络路径
              fileList: [data[i].userPhoto],
              success: res => {
                result.push({
                  iconPath: res.fileList[0].tempFileURL,
                  id: data[i]._id,
                  latitude: data[i].latitude,
                  longitude: data[i].longitude,
                  width: 50,
                  height: 50
                })
                this.setData({
                  markers:result
                })
              },
              fail: console.error
            })

          } else {
            result.push({
              iconPath: data[i].userPhoto,
              id: data[i]._id,
              latitude: data[i].latitude,
              longitude: data[i].longitude,
              width: 50,
              height: 50
            })
            this.setData({
              markers:result
            })
          }
        }
      }
    })
  },
  markertap(ev){
    wx.navigateTo({
      url: '/pages/index/detail/detail?userId=' + ev.markerId
    })
  }
})
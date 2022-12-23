import COS from 'cos-nodejs-sdk-v5'
import fs from 'fs'
import path from 'path'
import { PassThrough } from 'stream'

export default class CosManager {
  cos: COS
  Bucket: string
  Region: string

  constructor(SecretId: string, SecretKey: string, Bucket: string, Region: string) {
    this.cos = new COS({
      SecretId,
      SecretKey
    })

    this.Bucket = Bucket
    this.Region = Region
  }

  uploadFile (Key: string, filePath: string) {
    return new Promise((resolve, reject) => {
      this.cos.putObject({
        Bucket: this.Bucket, /* 填入您自己的存储桶，必须字段 */
        Region: this.Region,  /* 存储桶所在地域，例如ap-beijing，必须字段 */
        Key,  /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */
        StorageClass: 'STANDARD',
        /* 当Body为stream类型时，ContentLength必传，否则onProgress不能返回正确的进度信息 */
        Body: fs.createReadStream(filePath), // 上传文件对象
        ContentLength: fs.statSync(filePath).size,
        // onProgress: function (progressData) {
        //   console.log(JSON.stringify(progressData));
        // }
      }, (err, data) => {
        if (err) reject(err)
        resolve(data)
      });
    })
  }

  deleteFile (Key: string) {
    return new Promise((resolve, reject) => {
      this.cos.deleteObject({
        Bucket: this.Bucket, /* 填入您自己的存储桶，必须字段 */
        Region: this.Region,  /* 存储桶所在地域，例如ap-beijing，必须字段 */
        Key,  /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */
      }, (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })
  }

  downloadFile (Key: string, downloadPath: string) {
    return new Promise((resolve, reject) => {
      this.cos.getObject({
        Bucket: this.Bucket, /* 填入您自己的存储桶，必须字段 */
        Region: this.Region,  /* 存储桶所在地域，例如ap-beijing，必须字段 */
        Key,  /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */
      }, (err, data) => {
        if (err) reject({ err: err.code })
        const ws = fs.createWriteStream(path.resolve(downloadPath))
        var bufferStream = new PassThrough();
        bufferStream.end(data.Body)
        bufferStream.pipe(ws)
        resolve(new Promise((resolve, reject) => {
          ws.on('finish', resolve)
          ws.on('error', reject)
        }))
      })
    })
  }
}
import mongoose, { Schema } from 'mongoose'

export function connectMongo(uri: string) {
  return mongoose.connect(uri)
}

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
})

const candidateSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
})

const messageSchema = new Schema({
  candidateId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true })

const notificationSchema = new Schema({
  userId: { type: String, required: true },
  candidateId: { type: String, required: true },
  messageId: { type: String, required: true },
  preview: { type: String, required: true },
  createdAt: { type: Number, required: true },
  read: { type: Boolean, default: false },
})

export const UserModel = mongoose.model('User', userSchema)
export const CandidateModel = mongoose.model('Candidate', candidateSchema)
export const MessageModel = mongoose.model('Message', messageSchema)
export const NotificationModel = mongoose.model('Notification', notificationSchema)



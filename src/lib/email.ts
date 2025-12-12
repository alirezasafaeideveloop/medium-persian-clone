import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'بازیابی رمز عبور - مدیوم فارسی',
    html: `
      <div dir="rtl" style="font-family: 'Vazirmatn', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0 0 20px 0; font-size: 24px;">مدیوم فارسی</h1>
          <p style="color: white; margin: 0 0 30px 0; font-size: 16px;">درخواست بازیابی رمز عبور</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            سلام کاربر گرامی،
          </p>
          
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            شما درخواست بازیابی رمز عبور برای حساب کاربری خود در مدیوم فارسی داشته‌اید. برای ادامه، روی دکمه زیر کلیک کنید:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              بازیابی رمز عبور
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
            اگر شما این درخواست را نداده‌اید، لطفاً این ایمیل را نادیده بگیرید.
          </p>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            این لینک فقط برای ۱ ساعت معتبر است.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            با احترام،<br>
            تیم مدیوم فارسی
          </p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Password reset email sent successfully')
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw error
  }
}

export const sendWelcomeEmail = async (email: string, name: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'خوش آمدید به مدیوم فارسی',
    html: `
      <div dir="rtl" style="font-family: 'Vazirmatn', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0 0 20px 0; font-size: 24px;">مدیوم فارسی</h1>
          <p style="color: white; margin: 0 0 30px 0; font-size: 16px;">به جامعه ما خوش آمدید!</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            ${name} عزیز،
          </p>
          
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            به مدیوم فارسی خوش آمدید! ما از اینکه به جامعه ما پیوسته‌اید بسیار خوشحالیم.
          </p>
          
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            مدیوم فارسی یک پلتفرم انتشار محتوا به زبان فارسی است که در آن می‌توانید:
          </p>
          
          <ul style="color: #333; line-height: 1.6; margin-bottom: 20px; padding-right: 20px;">
            <li>مقالات خود را بنویسید و منتشر کنید</li>
            <li>با نویسندگان دیگر ارتباط برقرار کنید</li>
            <li>در انتشارات مختلف عضو شوید</li>
            <li>محتوای باکیفیت را کشف کنید</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              شروع کنید
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            با احترام،<br>
            تیم مدیوم فارسی
          </p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Welcome email sent successfully')
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw error
  }
}
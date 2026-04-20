import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    /**
     * يتم استدعاؤها بعد نجاح تسجيل دخول جوجل.
     * نقوم بإرسال id_token للباك إند الخاص بنا للحصول على JWT مخصص للموقع.
     */
    async signIn({ account, user }) {
      if (account?.provider === 'google' && account?.id_token) {
        try {
          console.log("🚀 Attempting backend sync at:", `${API_URL}/auth/google/callback`);
          
          const response = await axios.post(`${API_URL}/auth/google/callback`, {
            idToken: account.id_token,
          });

          // تخزين بيانات الباك إند مؤقتاً في كائن الـ account لنقلها للـ JWT callback
          account.backendToken = response.data.token;
          account.backendUser = response.data.user;
          
          console.log("✅ Backend auth successful!");
          return true; // الدخول نجح والربط مع الباك إند تم
        } catch (error) {
          // هـــــام: طبع الخطأ بالتفصيل لمعرفة سبب الـ 401
          console.error('❌ Backend auth failed:', error.response?.data || error.message);

          /**
           * تعديل كسر اللوب:
           * نرجع true حتى لو فشل الباك إند. هذا يسمح للمستخدم بالدخول للموقع 
           * ببيانات جوجل فقط، ويمنع NextAuth من الدخول في حلقة مفرغة من الـ AccessDenied.
           * يمكنك لاحقاً التحقق في الصفحات من وجود backendToken.
           */
          return true; 
        }
      }
      return true;
    },

    /**
     * يتم استدعاؤها لإنشاء أو تحديث الـ JWT الخاص بـ NextAuth.
     */
    async jwt({ token, account }) {
      // عند تسجيل الدخول لأول مرة، نأخذ التوكن القادم من الباك إند ونضعه في الـ Token
      if (account?.backendToken) {
        token.backendToken = account.backendToken;
        token.backendUser = account.backendUser;
      }
      return token;
    },

    /**
     * تجعل البيانات متاحة للفرونت إند عبر useSession() أو getServerSession().
     */
    async session({ session, token }) {
      // نمرر التوكن لصفحات الفرونت إند (زي صفحة الدفع)
      session.backendToken = token.backendToken;
      
      if (token.backendUser) {
        session.user.backendId = token.backendUser.id;
        // يمكنك إضافة أي بيانات مستخدم إضافية هنا
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // مدة الجلسة 7 أيام
  },

  // مفتاح التشفير الأساسي
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
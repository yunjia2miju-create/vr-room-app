const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPage.tsx', 'utf-8');

// import auth
code = code.replace(
  "import { storage } from '../firebase';",
  "import { storage, auth, googleProvider } from '../firebase';\nimport { signInWithPopup } from 'firebase/auth';"
);

// Add handleGoogleLogin
code = code.replace(
  "  const handleLogin = (e: React.FormEvent) => {",
  `  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        sessionStorage.setItem('taewang_admin_logged', 'true');
        setIsLoggedIn(true);
        setLoginError('');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      setLoginError('구글 로그인에 실패했습니다. ' + (error.message || ''));
    }
  };

  const handleLogin = (e: React.FormEvent) => {`
);

// Add onClick to button
code = code.replace(
  '<button type="button" className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3.5 rounded-xl font-bold transition-colors shadow-sm text-sm flex items-center justify-center gap-2 relative">',
  '<button type="button" onClick={handleGoogleLogin} className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3.5 rounded-xl font-bold transition-colors shadow-sm text-sm flex items-center justify-center gap-2 relative">'
);

fs.writeFileSync('src/components/AdminPage.tsx', code);

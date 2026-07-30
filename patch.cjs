const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPage.tsx', 'utf8');

const loginUI = `  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button className="flex-1 py-4 text-center font-bold text-[#009e73] border-b-2 border-[#009e73] flex items-center justify-center gap-2">
              <Lock size={18} />
              로그인
            </button>
            <button className="flex-1 py-4 text-center font-bold text-gray-400 flex items-center justify-center gap-2">
              <UserPlus size={18} />
              회원가입
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-gray-500 font-medium text-[13.5px] leading-relaxed mb-6">
              매물 등록 및 개인 맞춤 상담을 이용하시려면 이메일 혹은 소셜 계정으로 로그인해주세요.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-xl border border-red-100">
                  {loginError}
                </div>
              )}
              
              <div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="이메일 주소 입력" 
                  className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl px-4 py-3.5 text-sm focus:border-[#009e73] focus:ring-1 focus:ring-[#009e73] outline-none transition-all placeholder:text-gray-400 font-medium"
                  required
                />
              </div>

              <div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력" 
                  className="w-full bg-[#f8f9fa] border border-gray-100 rounded-xl px-4 py-3.5 text-sm focus:border-[#009e73] focus:ring-1 focus:ring-[#009e73] outline-none transition-all placeholder:text-gray-400 font-medium"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 bg-[#f4f6f8] hover:bg-[#e9ecef] text-gray-600 py-3.5 rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-2"
                >
                  홈으로
                </button>
                <button 
                  type="submit" 
                  className="flex-[1.8] bg-[#009e73] hover:bg-[#008f68] text-white py-3.5 rounded-xl font-bold transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
                >
                  <LogIn size={18} />
                  로그인 완료
                </button>
              </div>
            </form>

            <div className="mt-8 mb-6 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative bg-white px-4 text-xs font-bold text-gray-400 tracking-wider">
                SNS 간편 소셜 로그인
              </div>
            </div>

            <div className="space-y-3">
              <button type="button" className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3.5 rounded-xl font-bold transition-colors shadow-sm text-sm flex items-center justify-center gap-2 relative">
                <div className="absolute left-4 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/24/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                </div>
                Google 계정으로 원클릭 로그인
              </button>
              <button type="button" className="w-full bg-[#fee500] hover:bg-[#e6ce00] text-gray-900 py-3.5 rounded-xl font-bold transition-colors shadow-sm text-sm flex items-center justify-center gap-2 relative">
                <div className="absolute left-4 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/24/svg" fill="currentColor"><path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.3 4.5 6.6l-1 3.7c-.1.3 0 .7.3.8.3.2.7.2 1-.1l4.4-2.9c.2 0 .5.1.8.1 5.5 0 10-3.5 10-7.8S17.5 3 12 3z"/></svg>
                </div>
                카카오톡 3초 간편로그인
              </button>
              <button type="button" className="w-full bg-[#03c75a] hover:bg-[#02b350] text-white py-3.5 rounded-xl font-bold transition-colors shadow-sm text-sm flex items-center justify-center gap-2 relative">
                <div className="absolute left-4 font-black italic text-[20px] leading-none" style={{ fontFamily: 'Georgia, serif' }}>
                  N
                </div>
                네이버 아이디로 로그인
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }`;

// Find the if (!isLoggedIn) { block in code
const startIdx = code.indexOf('  if (!isLoggedIn) {');
const endIdx = code.indexOf('  return (\n    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 flex flex-col">');

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + loginUI + "\n" + code.substring(endIdx);
  fs.writeFileSync('src/components/AdminPage.tsx', code);
  console.log('Replaced successfully');
} else {
  console.log('Could not find block');
}

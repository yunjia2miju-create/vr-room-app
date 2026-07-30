  const vrCount = properties.filter(p => p.vr).length;
  const monthlyCount = properties.filter(p => p.contract.includes('월')).length;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-[#ff6600] p-8 text-center text-white relative">
            <div className="inline-flex p-3 bg-white/10 rounded-xl mb-3">
              <Building2 size={32} />
            </div>
            <h2 className="text-2xl font-black tracking-tight">태왕공인중개사</h2>
            <p className="text-orange-100 text-sm mt-1">공실현황 및 VR 매물 관리 시스템</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {loginError && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold p-3.5 rounded-lg border border-red-100">
                {loginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">관리자 ID</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ID를 입력하세요" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#ff6600] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">비밀번호</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#ff6600] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#ff6600] hover:bg-[#e65c00] text-white py-3.5 rounded-xl font-bold transition-colors shadow-md shadow-orange-600/10"
            >
              로그인하기
            </button>

            {/* Dev Demo Notice Box */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex gap-3">
              <Info size={18} className="text-[#ff6600] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-gray-600">
                <span className="font-bold text-gray-800">데모 시스템 테스트용 계정:</span>
                <div className="mt-1 flex gap-4">
                  <span>ID: <strong className="text-gray-900">admin</strong></span>
                  <span>PW: <strong className="text-gray-900">1</strong></span>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <button 
          onClick={() => navigate('/')}
          className="mt-6 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          홈페이지로 이동
        </button>
      </div>
    );

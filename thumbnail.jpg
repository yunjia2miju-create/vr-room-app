const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// 고객님의 프로젝트 ID를 명시적으로 설정합니다.
admin.initializeApp({
  projectId: "project-3758368870789431339"
});
const { getFirestore } = require("firebase-admin/firestore");

// 데이터베이스 ID를 지정합니다.
const db = getFirestore("ai-studio-realestatedashbo-3f2b1139-2496-4de2-87c9-def79bc9970a");

exports.serveDynamicOG = onRequest({ invoker: "public" }, async (req, res) => {
  try {
    // 1. 기본 웹사이트의 index.html을 가져옵니다.
    const response = await fetch("https://054-455-6789.com/index.html");
    let html = await response.text();

    // 2. 접속한 주소에서 매물 ID를 추출합니다 (예: /property/123)
    const match = req.path.match(/\/property\/([a-zA-Z0-9_-]+)/);
    
    if (match && match[1]) {
      const propertyId = match[1];
      
      // 3. 데이터베이스에서 해당 매물 정보 가져오기
      let propertyData = null;
      const propertiesRef = db.collection("properties");
      
      const querySnapshot = await propertiesRef.where("id", "==", propertyId).get();
      if (!querySnapshot.empty) {
        propertyData = querySnapshot.docs[0].data();
      } else {
        const docSnapshot = await propertiesRef.doc(propertyId).get();
        if (docSnapshot.exists) {
          propertyData = docSnapshot.data();
        }
      }

      // 4. 데이터가 존재하면 매물 정보와 썸네일(vrUrl)로 치환합니다
      if (propertyData) {
        const title = `태왕공인중개사사무소 - 매물 ${propertyData.mgt || 'TW'}-${propertyData.id || propertyId}`;
        const description = `${propertyData.addr || ''} / ${propertyData.type || ''} / ${propertyData.contract || ''} / 보증금 ${propertyData.deposit || 0}만, 월 ${propertyData.rent || 0}만`;
        const url = `https://054-455-6789.com${req.path}`;
        
        // 기본 썸네일 이미지 설정
        let imageUrl = "https://054-455-6789.com/thumbnail.jpg";
        
        if (propertyData.vrUrl) {
          const urlMatch = propertyData.vrUrl.match(/https?:\/\/[^\s,]+/);
          if (urlMatch) {
            const firstUrl = urlMatch[0];
            const kuulaMatch = firstUrl.match(/kuula\.co\/share\/([a-zA-Z0-9_-]+)/);
            if (kuulaMatch) {
              // Kuula 360 뷰어 링크인 경우, Kuula의 커버 이미지 URL로 변환
              imageUrl = `https://files.kuula.io/${kuulaMatch[1]}/01-cover.jpg`;
            } else if (firstUrl.includes("firebasestorage") || /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(firstUrl)) {
              // Firebase 스토리지나 일반 이미지 파일인 경우 그대로 사용
              imageUrl = firstUrl;
            }
          }
        }

        html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
        html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
        html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`);
        // 여기서 카카오톡 공유 시 보이는 이미지를 바꿉니다!
        html = html.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${imageUrl}" />`);
        html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`);
      }
    }

    res.status(200).send(html);
  } catch (error) {
    console.error("Error serving dynamic OG:", error);
    res.status(500).send("Server Error");
  }
});
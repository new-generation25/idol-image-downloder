import React, { useState, useEffect } from "react";

interface Idol {
  id: string;
  name: string;
  group: string;
}

interface Group {
  id: string;
  name: string;
  members: Idol[];
}

// 이미지 검색 함수 (나무위키만)
async function fetchNamuWikiImage(query: string): Promise<string> {
  try {
    const res = await fetch(`/api/search-images?query=${encodeURIComponent(query + ' site:namu.wiki')}`);
    const data = await res.json();
    if (data.images && data.images.length > 0) {
      return data.images[0].link;
    }
  } catch {}
  return "/no-image.png";
}

export default function Home() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [tournament, setTournament] = useState<Idol[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [currentMatch, setCurrentMatch] = useState<number>(0);
  const [winners, setWinners] = useState<Idol[]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [finalWinner, setFinalWinner] = useState<Idol | null>(null);
  const [currentImages, setCurrentImages] = useState<string[]>(["/no-image.png", "/no-image.png"]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [winnerImage, setWinnerImage] = useState<string>("/no-image.png");

  // K-POP 여자 아이돌 그룹 데이터
  const idolGroups: Group[] = [
    {
      id: "gidle",
      name: "(G)I-DLE",
      members: [
        { id: "gidle_soyeon", name: "소연", group: "(G)I-DLE" },
        { id: "gidle_miyeon", name: "미연", group: "(G)I-DLE" },
        { id: "gidle_minnie", name: "민니", group: "(G)I-DLE" },
        { id: "gidle_yuqi", name: "우기", group: "(G)I-DLE" },
        { id: "gidle_shuhua", name: "슈화", group: "(G)I-DLE" }
      ]
    },
    {
      id: "itzy",
      name: "ITZY",
      members: [
        { id: "itzy_yeji", name: "예지", group: "ITZY" },
        { id: "itzy_lia", name: "리아", group: "ITZY" },
        { id: "itzy_ryujin", name: "류진", group: "ITZY" },
        { id: "itzy_chaeryeong", name: "채령", group: "ITZY" },
        { id: "itzy_yuna", name: "유나", group: "ITZY" }
      ]
    },
    {
      id: "aespa",
      name: "aespa",
      members: [
        { id: "aespa_karina", name: "카리나", group: "aespa" },
        { id: "aespa_winter", name: "윈터", group: "aespa" },
        { id: "aespa_giselle", name: "지젤", group: "aespa" },
        { id: "aespa_ningning", name: "닝닝", group: "aespa" }
      ]
    },
    {
      id: "stayc",
      name: "STAYC",
      members: [
        { id: "stayc_sumin", name: "수민", group: "STAYC" },
        { id: "stayc_sieun", name: "시은", group: "STAYC" },
        { id: "stayc_isa", name: "아이사", group: "STAYC" },
        { id: "stayc_seeun", name: "세은", group: "STAYC" },
        { id: "stayc_yoon", name: "윤", group: "STAYC" },
        { id: "stayc_j", name: "재이", group: "STAYC" }
      ]
    },
    {
      id: "ive",
      name: "IVE",
      members: [
        { id: "ive_yujin", name: "유진", group: "IVE" },
        { id: "ive_gaeul", name: "가을", group: "IVE" },
        { id: "ive_rei", name: "레이", group: "IVE" },
        { id: "ive_wonyoung", name: "원영", group: "IVE" },
        { id: "ive_liz", name: "리즈", group: "IVE" },
        { id: "ive_leeseo", name: "이서", group: "IVE" }
      ]
    },
    {
      id: "newjeans",
      name: "NewJeans",
      members: [
        { id: "newjeans_minji", name: "민지", group: "NewJeans" },
        { id: "newjeans_hanni", name: "하니", group: "NewJeans" },
        { id: "newjeans_danielle", name: "다니엘", group: "NewJeans" },
        { id: "newjeans_haerin", name: "해린", group: "NewJeans" },
        { id: "newjeans_hyein", name: "혜인", group: "NewJeans" }
      ]
    },
    {
      id: "lesserafim",
      name: "LE SSERAFIM",
      members: [
        { id: "lesserafim_sakura", name: "사쿠라", group: "LE SSERAFIM" },
        { id: "lesserafim_chaewon", name: "김채원", group: "LE SSERAFIM" },
        { id: "lesserafim_yunjin", name: "허윤진", group: "LE SSERAFIM" },
        { id: "lesserafim_kazuha", name: "카즈하", group: "LE SSERAFIM" },
        { id: "lesserafim_eunchae", name: "홍은채", group: "LE SSERAFIM" }
      ]
    },
    {
      id: "nmixx",
      name: "NMIXX",
      members: [
        { id: "nmixx_lily", name: "릴리", group: "NMIXX" },
        { id: "nmixx_haewon", name: "해원", group: "NMIXX" },
        { id: "nmixx_sullyoon", name: "설윤", group: "NMIXX" },
        { id: "nmixx_bae", name: "배이", group: "NMIXX" },
        { id: "nmixx_jiwoo", name: "지우", group: "NMIXX" },
        { id: "nmixx_kyujin", name: "규진", group: "NMIXX" }
      ]
    },
    {
      id: "fiftyfifty",
      name: "FIFTY FIFTY",
      members: [
        { id: "fiftyfifty_aran", name: "아란", group: "FIFTY FIFTY" },
        { id: "fiftyfifty_keena", name: "키나", group: "FIFTY FIFTY" },
        { id: "fiftyfifty_saena", name: "세나", group: "FIFTY FIFTY" },
        { id: "fiftyfifty_sio", name: "시오", group: "FIFTY FIFTY" }
      ]
    },
    {
      id: "kissoflife",
      name: "KISS OF LIFE",
      members: [
        { id: "kissoflife_julie", name: "줄리", group: "KISS OF LIFE" },
        { id: "kissoflife_natty", name: "나타샤", group: "KISS OF LIFE" },
        { id: "kissoflife_belle", name: "벨", group: "KISS OF LIFE" },
        { id: "kissoflife_haneul", name: "하늘", group: "KISS OF LIFE" }
      ]
    },
    {
      id: "babymonster",
      name: "BABYMONSTER",
      members: [
        { id: "babymonster_ahyeon", name: "아현", group: "BABYMONSTER" },
        { id: "babymonster_ruka", name: "루카", group: "BABYMONSTER" },
        { id: "babymonster_chiquita", name: "치키타", group: "BABYMONSTER" },
        { id: "babymonster_pharita", name: "파리타", group: "BABYMONSTER" },
        { id: "babymonster_asa", name: "아사", group: "BABYMONSTER" },
        { id: "babymonster_rami", name: "라미", group: "BABYMONSTER" },
        { id: "babymonster_rora", name: "로라", group: "BABYMONSTER" }
      ]
    },
    {
      id: "illit",
      name: "ILLIT",
      members: [
        { id: "illit_yoona", name: "윤아", group: "ILLIT" },
        { id: "illit_minju", name: "민주", group: "ILLIT" },
        { id: "illit_iroha", name: "이로하", group: "ILLIT" },
        { id: "illit_moka", name: "모카", group: "ILLIT" },
        { id: "illit_wonhee", name: "원희", group: "ILLIT" }
      ]
    },
    {
      id: "twice",
      name: "TWICE",
      members: [
        { id: "twice_nayeon", name: "나연", group: "TWICE" },
        { id: "twice_jeongyeon", name: "정연", group: "TWICE" },
        { id: "twice_momo", name: "모모", group: "TWICE" },
        { id: "twice_sana", name: "사나", group: "TWICE" },
        { id: "twice_jihyo", name: "지효", group: "TWICE" },
        { id: "twice_mina", name: "미나", group: "TWICE" },
        { id: "twice_dahyun", name: "다현", group: "TWICE" },
        { id: "twice_chaeyoung", name: "채영", group: "TWICE" },
        { id: "twice_tzuyu", name: "쯔위", group: "TWICE" }
      ]
    },
    {
      id: "blackpink",
      name: "BLACKPINK",
      members: [
        { id: "blackpink_jisoo", name: "지수", group: "BLACKPINK" },
        { id: "blackpink_jennie", name: "제니", group: "BLACKPINK" },
        { id: "blackpink_rose", name: "로제", group: "BLACKPINK" },
        { id: "blackpink_lisa", name: "리사", group: "BLACKPINK" }
      ]
    },
    {
      id: "redvelvet",
      name: "Red Velvet",
      members: [
        { id: "redvelvet_irene", name: "아이린", group: "Red Velvet" },
        { id: "redvelvet_seulgi", name: "슬기", group: "Red Velvet" },
        { id: "redvelvet_wendy", name: "웬디", group: "Red Velvet" },
        { id: "redvelvet_joy", name: "조이", group: "Red Velvet" },
        { id: "redvelvet_yeri", name: "예리", group: "Red Velvet" }
      ]
    }
  ];

  useEffect(() => {
    setGroups(idolGroups);
  }, []);

  // 그룹 선택 토글
  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // 토너먼트 시작
  const startTournament = () => {
    if (selectedGroups.length < 2) {
      alert("최소 2개 이상의 그룹을 선택해주세요!");
      return;
    }

    // 선택된 그룹의 모든 멤버를 가져와서 섞기
    const allMembers: Idol[] = [];
    selectedGroups.forEach(groupId => {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        allMembers.push(...group.members);
      }
    });

    // 64명으로 맞추기 (부족하면 반복, 많으면 잘라내기)
    let tournamentMembers: Idol[] = [];
    while (tournamentMembers.length < 64) {
      tournamentMembers.push(...allMembers);
    }
    tournamentMembers = tournamentMembers.slice(0, 64);

    // 랜덤 섞기
    for (let i = tournamentMembers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tournamentMembers[i], tournamentMembers[j]] = [tournamentMembers[j], tournamentMembers[i]];
    }

    setTournament(tournamentMembers);
    setCurrentRound(1);
    setCurrentMatch(0);
    setWinners([]);
    setGameStarted(true);
    setGameFinished(false);
    setFinalWinner(null);
  };

  // 승자 선택
  const selectWinner = (winner: Idol) => {
    const newWinners = [...winners, winner];
    setWinners(newWinners);

    // 현재 라운드의 모든 매치가 끝났는지 확인
    const matchesInCurrentRound = Math.floor(tournament.length / Math.pow(2, currentRound));
    const currentMatchIndex = currentMatch + 1;

    if (currentMatchIndex >= matchesInCurrentRound) {
      // 다음 라운드로
      if (newWinners.length === 1) {
        // 최종 우승자
        setFinalWinner(newWinners[0]);
        setGameFinished(true);
      } else {
        setTournament(newWinners);
        setCurrentRound(prev => prev + 1);
        setCurrentMatch(0);
        setWinners([]);
      }
    } else {
      // 같은 라운드의 다음 매치
      setCurrentMatch(currentMatchIndex);
    }
  };

  // 게임 재시작
  const restartGame = () => {
    setSelectedGroups([]);
    setTournament([]);
    setCurrentRound(0);
    setCurrentMatch(0);
    setWinners([]);
    setGameStarted(false);
    setGameFinished(false);
    setFinalWinner(null);
  };

  // 현재 매치의 두 아이돌 가져오기
  const getCurrentMatch = () => {
    const matchesInCurrentRound = Math.floor(tournament.length / Math.pow(2, currentRound));
    const startIndex = currentMatch * 2;
    return [tournament[startIndex], tournament[startIndex + 1]];
  };

  // 매치가 바뀔 때마다 이미지 검색
  useEffect(() => {
    if (!gameStarted) return;
    const [idol1, idol2] = getCurrentMatch();
    setLoadingImages(true);
    Promise.all([
      fetchNamuWikiImage(`${idol1.group} ${idol1.name}`),
      fetchNamuWikiImage(`${idol2.group} ${idol2.name}`)
    ]).then(imgs => {
      setCurrentImages(imgs);
      setLoadingImages(false);
    });
    // eslint-disable-next-line
  }, [gameStarted, currentMatch, currentRound]);

  useEffect(() => {
    if (gameFinished && finalWinner) {
      fetchNamuWikiImage(`${finalWinner.group} ${finalWinner.name}`).then(img => setWinnerImage(img));
    }
  }, [gameFinished, finalWinner]);

  if (gameFinished && finalWinner) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px"
      }}>
        <div style={{
          background: "#fff",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          padding: "40px",
          textAlign: "center",
          maxWidth: "600px",
          width: "100%"
        }}>
          <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "#667eea", marginBottom: "20px" }}>
            🏆 우승자 🏆
          </h1>
          <div style={{
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            overflow: "hidden",
            margin: "0 auto 30px",
            border: "8px solid #667eea",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff"
          }}>
            <img
              src={winnerImage}
              alt={finalWinner.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { e.currentTarget.src = "/no-image.png"; }}
            />
          </div>
          <h2 style={{ fontSize: "36px", fontWeight: "bold", color: "#333", marginBottom: "10px" }}>
            {finalWinner.name}
          </h2>
          <p style={{ fontSize: "24px", color: "#666", marginBottom: "30px" }}>
            {finalWinner.group}
          </p>
          <button
            onClick={restartGame}
            style={{
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "16px 32px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
            }}
          >
            다시 시작하기
          </button>
        </div>
      </div>
    );
  }

  if (gameStarted) {
    const [idol1, idol2] = getCurrentMatch();
    const totalMatches = Math.floor(tournament.length / Math.pow(2, currentRound));
    const progress = ((currentMatch + 1) / totalMatches) * 100;

    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px"
      }}>
        <div style={{
          background: "#fff",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          padding: "40px",
          maxWidth: "1000px",
          width: "100%",
          textAlign: "center"
        }}>
          <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "#667eea", marginBottom: "20px" }}>
            🏆 K-POP 여자 아이돌 이상형 월드컵 🏆
          </h1>
          <div style={{ marginBottom: "30px" }}>
            <p style={{ fontSize: "18px", color: "#666", marginBottom: "10px" }}>
              {currentRound}라운드 - {currentMatch + 1}/{totalMatches} 매치
            </p>
            <div style={{
              width: "100%",
              height: "8px",
              background: "#eee",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                transition: "width 0.3s ease"
              }} />
            </div>
          </div>
          {/* vs 표기 - 카드 위쪽 중앙 */}
          <div style={{
            width: "100%",
            textAlign: "center",
            fontWeight: 700,
            fontSize: 24,
            color: "#764ba2",
            letterSpacing: 2,
            marginBottom: "8px"
          }}>
            vs
          </div>
          <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "20px"
          }}>
            {/* 왼쪽 카드 */}
            <div
              key={idol1.id}
              onClick={() => selectWinner(idol1)}
              style={{
                cursor: "pointer",
                padding: "10px",
                borderRadius: "12px",
                border: "2px solid transparent",
                transition: "all 0.3s ease",
                background: "#f8f9fa",
                maxWidth: 220,
                margin: "0 auto"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div style={{
                width: "150px",
                height: "150px",
                borderRadius: "16px",
                overflow: "hidden",
                margin: "0 auto 12px",
                border: "3px solid #667eea",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff"
              }}>
                {loadingImages ? (
                  <span style={{fontSize: 18, color: "#aaa"}}>로딩중...</span>
                ) : (
                  <img
                    src={currentImages[0]}
                    alt={idol1.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.currentTarget.src = "/no-image.png"; }}
                  />
                )}
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#333", marginBottom: "6px" }}>
                {idol1.name}
              </h3>
              <div style={{ fontSize: "14px", color: "#666" }}>{idol1.group}</div>
            </div>
            {/* 오른쪽 카드 */}
            <div
              key={idol2.id}
              onClick={() => selectWinner(idol2)}
              style={{
                cursor: "pointer",
                padding: "10px",
                borderRadius: "12px",
                border: "2px solid transparent",
                transition: "all 0.3s ease",
                background: "#f8f9fa",
                maxWidth: 220,
                margin: "0 auto"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div style={{
                width: "150px",
                height: "150px",
                borderRadius: "16px",
                overflow: "hidden",
                margin: "0 auto 12px",
                border: "3px solid #667eea",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff"
              }}>
                {loadingImages ? (
                  <span style={{fontSize: 18, color: "#aaa"}}>로딩중...</span>
                ) : (
                  <img
                    src={currentImages[1]}
                    alt={idol2.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.currentTarget.src = "/no-image.png"; }}
                  />
                )}
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#333", marginBottom: "6px" }}>
                {idol2.name}
              </h3>
              <div style={{ fontSize: "14px", color: "#666" }}>{idol2.group}</div>
            </div>
          </div>
          <button
            onClick={restartGame}
            style={{
              background: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            처음부터 다시 시작
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "24px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        padding: "40px",
        maxWidth: "1200px",
        width: "100%"
      }}>
        <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "#667eea", textAlign: "center", marginBottom: "20px" }}>
          🏆 K-POP 여자 아이돌 이상형 월드컵 🏆
        </h1>
        <p style={{ fontSize: "18px", color: "#666", textAlign: "center", marginBottom: "40px" }}>
          16개 아이돌 중 64강 토너먼트에 참여할 그룹을 선택해주세요.
        </p>

        {/* 선택된 그룹 상단 표시 */}
        {selectedGroups.length > 0 && (
          <div style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 18,
            color: "#667eea"
          }}>
            {selectedGroups.length}개 그룹 (
            {
              selectedGroups
                .map(gid => groups.find(g => g.id === gid)?.members.length || 0)
                .reduce((a, b) => a + b, 0)
            }명) 선택됨
          </div>
        )}

        {/* 2x8 그리드로 그룹 나열 (2열 8행) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gridTemplateRows: "repeat(8, 1fr)",
          gap: "14px",
          marginBottom: "40px"
        }}>
          {groups.map((group, idx) => (
            <div
              key={group.id}
              onClick={() => toggleGroup(group.id)}
              style={{
                minHeight: "48px",
                height: "48px",
                borderRadius: "8px",
                border: selectedGroups.includes(group.id) ? "2.5px solid #667eea" : "1.5px solid #bbb",
                cursor: "pointer",
                transition: "all 0.2s",
                background: selectedGroups.includes(group.id) ? "#f0f4ff" : "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: 16,
                boxShadow: selectedGroups.includes(group.id) ? "0 2px 8px #667eea22" : "none"
              }}
            >
              <span style={{ color: selectedGroups.includes(group.id) ? "#667eea" : "#222" }}>{group.name}</span>
              <span style={{ fontSize: 13, color: "#888", fontWeight: 400 }}>
                {group.members.length}명
              </span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
            선택된 그룹: {selectedGroups.length}개
          </p>
          <button
            onClick={startTournament}
            disabled={selectedGroups.length < 2}
            style={{
              background: selectedGroups.length >= 2 
                ? "linear-gradient(90deg, #667eea 0%, #764ba2 100%)" 
                : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "16px 32px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: selectedGroups.length >= 2 ? "pointer" : "not-allowed",
              boxShadow: selectedGroups.length >= 2 ? "0 4px 15px rgba(0,0,0,0.2)" : "none"
            }}
          >
            토너먼트 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

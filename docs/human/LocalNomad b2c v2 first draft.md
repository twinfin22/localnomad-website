LocalNomad 

- 브랜드 컬러: 1B4965  
- 포인트 컬러: D64045

* 미션: 비자 정보의 비대칭을 해소한다. 외국인 직장/학생이 비자 요건·절차·서류를 직접 파악하고 준비할 수 있도록 도구를 제공한다. 법률 자문이 아닌 \*\*정보 플랫폼\*\*.  
* 핵심 기능: HiKorea wrapper 로 ux 좋게 정보 전달  
  * Ux 좋은 Single source of truth  
  * 알람 기능으로 peace of mind  
  * 세부 기능  
    * 비자 별 Checklist / 상세 페이지  
      * 체크리스트 (자격 요건 at a glance)  
        * | 구분 | 검증 항목 | 시스템 로직 / 사용자 가이드 | 등  
      * 상세페이지  
        * \- 신청 절차 (7+ 스텝)  
        * \- 필요 서류 체크리스트   
        * \- 수수료·처리기간  
        * \- FAQ (10+개)  
        * \- 공식 출처 링크  
      * 페이지 하단에는 비자 심사 가산점 팁들 reddit / fb community / discord community 등에서 긁어 모아서 제공  
    * Visa Path Simulator  
      * A 비자에서 b 비자로 바꿔탈 때 필요한 것.   
      * 문제: 근데 이 정보 어디서 와? 출처 확인 필요  
      * 전환 경로·요건·타임라인·서류 시각화  
      * Renewal / Extension 시 필요한 것들  
    * Visa Comparison Tool  
      * 표 형식, 비자 2-4개 나란히 비교 (자격, 기간, 서류, 비용 등).  
    * Visa Type Overview  
      * 알기 쉽게 Type A 부터 F 까지, H 도 보여줘  
    * 비자 대시보드 (로그인 필요)  
      * Visa health monitor  
      * OASIS 등 점수 모아야 할 경우, 점수 트레킹  
      * Progress bar 맨 상단  
      * Tax residency tracker  
* 한국 페이지에서는 Visa 외에 Tax (Coming Soon) 메인 랜딩에는 보여주고, 이메일 수집 (first to know)  
* 커뮤니티 (디스코드 연결 추후)

* 회원 관리  
  * 매직 링크로 계정 관리  
  * 로그인 했을 때만 비자 대시보드 이용 가능  
  * 일단은 전부 무료. 베타테스트 이후 유료화  
  * 

* User Flow  
  * 로컬노마드 메인페이지 \-\> 국가 선택 (한국/대만)  
  * 한국  
    * 비자  
      * I already have visa  
        * (click) i want a renewal  
        * (click) i want to change to a dif visa  
      * I want to get a visa  
        * I know what visa I want  
        * I don’t know, i want to compare my options  
    * 텍스 커밍 쑨. Subscribe to be the first to know  
  * 대만  
    * 비자  
      * I already have visa  
        * (click) i want a renewal  
        * (click) i want to change to a dif visa  
      * I want to get a visa  
        * I know what visa I want  
        * I don’t know, i want to compare my options  
* 디자인시 주의사항  
  * Info overwhelm 하지 않도록. Frontloading 금지. backloading  
  * Peace of mind 주는 게 중요해  
* 경쟁사 벤치마킹. Boundless / Alma 의 3 layer 정보 구조  
  * Glancable zone (hero/top)  
    * 지금 너의 현 상태 요약  
    * 색상 코딩 (빨강. 노랑. 초록)  
    * Visa status (d-day)  
      * 비자 만료일, 연장 신청 가능 시작일(만료 4개월 전), 세법상 거주자(183일) 도달 시점 등 카운트다운.  
    * Next action (CTA)  
      * "지금 FBI 범죄경력증명서를 신청해야 3주 뒤 비자 신청 가능합니다"와 같은 타임라인 기반 푸시 알림.  
  * Action Zone (mid)  
    * 상세 체크리스트  
    * Docs checklist  
    * Upcoming deadlines  
    * Quick actions  
    * Alert & notification  
  * Context Zone (bottom)  
    * 서류 가이드  
    * Visa path simulator  
    * Related news (요즘 비자 정책 트렌드 등)  
    * Community Q\&A  
* 규제 컴플라이언스  
  * 한국  
    * 행정사 관련 법 준수  
    * 문서 작성 금지  
    * 행정사 중개 금지  
    * 법적 판단 (eligibility quiz) 금지  
    * 하이코리아 스크래핑 X 매크로 X  
    * 가능한 부분  
      * File sanitizer (resizing, 제목 템플릿 준수 등) 단, 개인정보 담긴 파일이 로컬 스토리지 떠나지 않아야 함. 그게 가능한가?  
      * 일정 관리 알림  
    * 홈페이지 하단에 디스클레이머  
      * 예시) Important Notice  
      * This information is for general guidance only and does not constitute legal advice. For personalized immigration guidance, consult a licensed immigration consultant (행정사) or attorney (변호사).  
      * Final decisions on visa issuance rest solely with the Korean Ministry of Justice and immigration authorities. Always verify current requirements with the Korea Immigration Service or HiKorea before applying.  
    * \- 행정사법: 행정사 업무 대행 불가  
    * \- 변호사법: 법률 자문 불가  
    * \- 표시광고법: 입증 안 된 수치 광고 불가  
    * \- ✅ 가능: 공개 요건 표시, 퀴즈, 계산기, 체크리스트, 정보 상품 판매  
    * \- ❌ 금지: "자격 있다", "적격", "추천 비자", 신청 대행, HiKorea 연동

* Taiwan  
  * \- Immigration Act §56: 이민 업무 무면허 영업 금지  
    * \- Attorney Act §127: 무면허 법률 자문 시 최대 1년 징역  
    * \- ❌ 금지: 점수/퍼센트/매치 레벨 표시, "자격 있다", 정부 양식 자동 작성, "諮詢" 용어 사용  
    * \- ✅ 필수: 모든 대만 페이지에 영어+繁體中文 면책조항, 클라이언트 사이드 전용 데이터 처리 (클라이언트 사이드 localStorage (서버 저장 없음, 대만 법률 요건)  
    * 페이지 하단 디스클레이머  
      * mportant Notice  
      * This information is compiled from publicly available sources for general reference only. It does not constitute immigration consulting (移民諮詢), document preparation services, or legal advice. LocalNomad is not a licensed Immigration Service Organization (移民業務機構) under Taiwan's Immigration Act.  
      * For personalized immigration guidance, consult a licensed Immigration Service Organization (移民業務機構) or attorney (律師). Final decisions on visa issuance rest with Taiwan's National Immigration Agency, Bureau of Consular Affairs, and Ministry of Labor.

* 확인 필요한 부분  
  * 워홀 비자같은 경우, 그 사람의 국적별로 쿼타가 달라짐. 따라서 워홀 비자를 선택했을 경우, ux 상에서 ‘당신의 국적’ 을 우선적으로 물어봐야 함  
    * 이처럼 유저의 국적(혹은 다른 특정 정보) 에 따라 필요한 정보가 크게 달라지는 다른 비자가 있는지 확인 필요   
  * 오아시스 비자나, 영주권 전환 의 경우, 점수 모으는 포인트제도가 있는데, point calculator 가 공식 버전이 있는지, 아니면 우리가 만들어야 하는지

* Supported languaged  
  * | Locale | Language | Korea | Taiwan |  
  * |--------|----------|-------|--------|  
  * | en | English | ✅ | ✅ |  
  * | ja | 日本語 | ✅ | ❌ |  
  * | zh-tw | 繁體中文 | ✅ | ✅ |  
  * | vi | Tiếng Việt | ✅ | ❌ |

기타 정보

* 수요 분석  
  * | 순위 | 세그먼트 | 수요 트렌드 | 경쟁 | 근거 |  
  * |------|---------|-----------|------|------|  
  * | 1 | \*\*한국 F-1-D (디지털 노마드)\*\* | 📈 급상승 | 중간 (원스톱 가이드 부재) | 2024.1 출시 후 미디어 폭발, 10+ 사이트 있으나 깊은 원스톱 없음 |  
  * | 2 | \*\*대만 DNV (디지털 노마드)\*\* | 📈 신규 | 낮음 (블루오션) | 2025.1 출시, 정보 극소, 2026 2년 연장으로 수요 증가 예상 |  
  * | 3 | \*\*한국 E-7 → F-2 전환\*\* | ➡️ 꾸준 | 중간 (깊이 부족) | Path Simulator의 킬러 유스케이스, 기존 사이트 표면적 |  
  * | 4 | \*\*한국 H-1 (워킹홀리데이)\*\* | ➡️ 꾸준 | 높음 (레드오션) | GoGoHanguk·JENZA·Allo Korea가 이미 커버. 차별화 필요 |  
  * | 5 | \*\*대만 Gold Card\*\* | 📈 급상승 | 높음 | taiwangoldcard.com이 사실상 독점, 진입 어려움 |

* 비자 체크리스트 예시  
  *   
  * \#\#\# \*\*\\\*\\\* F-1-D (디지털 노마드) 체크리스트\\\*\\\*\*\*  
  *   
  * | 구분 | 검증 항목 | 시스템 로직 / 사용자 가이드 |  
  * | :---- | :---- | :---- |  
  * | \*\*소득\*\* | 전년도 GNI 2배 (약 8,800만원) | 🚨 \*\*주의:\*\* 세전(Gross) 기준. 가족 동반 시 합산 불가. |  
  * | \*\*고용\*\* | 현 업종 1년 이상 경력 | 📄 \*\*서류:\*\* 재직증명서에 "원격 근무 가능(Remote Work Allowed)" 문구 필수 포함 체크. |  
  * | \*\*보험\*\* | 보장액 1억 원 이상 | 📄 \*\*서류:\*\* 약관에 "본국 송환(Repatriation)" 문구가 포함되었는지 OCR로 자동 검사. |  
  * | \*\*범죄경력\*\* | 6개월 이내 발급 \\+ 아포스티유 | ⏳ \*\*로직:\*\* 발급일로부터 5개월 경과 시 "재발급 경고" 알림 발송. |  
  *   
  * \#\#\# \*\*\\\*\\\* H-1 (워킹홀리데이) 체크리스트\\\*\\\*\*\*  
  *   
  * | 구분 | 검증 항목 | 시스템 로직 / 사용자 가이드 |  
  * | :---- | :---- | :---- |  
  * | \*\*쿼터\*\* | 국가별 연간 쿼터 잔여 여부 | 🇺🇸 미국 2,000명 / 🇫🇷 프랑스 2,000명 등 실시간 마감 현황 크롤링(가능 시). |  
  * | \*\*재정\*\* | 초기 정착금 (약 300만원) | 🏦 \*\*팁:\*\* 입출금 내역이 없는 '급조된 목돈'은 반려 위험. 3개월 평균 잔고 확인. |  
  * | \*\*계획서\*\* | 여행/관광 주 목적 입증 | ✍️ \*\*가이드:\*\* "알바", "취업" 단어 사용 금지. "문화 체험", "여행" 키워드 자동 추천. |  
  *   
  * \#\#\# \*\*\\\*\\\* D-8-4 (기술창업) 체크리스트\\\*\\\*\*\*  
  *   
  * | 구분 | 검증 항목 | 시스템 로직 / 사용자 가이드 |  
  * | :---- | :---- | :---- |  
  * | \*\*OASIS\*\* | 80점 이상 획득 여부 | 🧮 \*\*계산기:\*\* 교육 이수(25점) \\+ 특허 출원(20점) \\+ 법인 설립(15점) 등 조합 시뮬레이션. |  
  * | \*\*필수\*\* | 법인 설립 완료 | 🏢 \*\*팁:\*\* 자본금 1억 원 필수 여부 확인 (D-8-4는 예외 가능하나 D-8-1은 필수). |  
  * | \*\*혁신성\*\* | (D-8-4S) 민간 평가 추천 | 📄 \*\*서류:\*\* K-Startup 추천서 발급 링크 연동. |

* Related News 예시  
  * \* \*\*디지털 노마드(워케이션) 비자(F-1-D) 정식 도입 및 확대:\*\* 시범 운영을 거쳐 정규화된 이 비자는 한국에 법인이 없는 외국인도 장기 체류할 수 있는 길을 열었다.    
  * \* \*\*K-컬처 연수 비자 신설:\*\* 한류에 관심 있는 젊은 층을 타깃으로 엔터테인먼트 연수 목적의 체류를 허용, 잠재적인 장기 체류군을 양성한다.    
  * \* \*\*숙련기능인력 및 우수 인재 점수제 완화:\*\* F-2-7(점수제 우수 인재) 및 E-7-4(숙련기능인력)의 쿼터를 확대하여, 단순 노무나 단기 체류자가 아닌 '정주형 이민자'를 늘리고 있다.
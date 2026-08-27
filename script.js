/**
 * 주식회사 더드림 랩 (The Dream Lab) - B2B LG가전 통합 스크립트
 * SEO, 접근성, 데이터 정합성, 장바구니 및 견적서 출력 시스템
 */

// 운영 배포 시 window.DREAMLAB_FORM_ENDPOINT에 실제 폼 수신 URL을 주입합니다.
// 미설정 상태에서는 고객에게 접수 완료를 표시하지 않고 대표 연락처를 안내합니다.
const FORM_ENDPOINT = typeof window.DREAMLAB_FORM_ENDPOINT === 'string'
    ? window.DREAMLAB_FORM_ENDPOINT.trim()
    : '';

function isFormEndpointConfigured() {
    return /^https:\/\//.test(FORM_ENDPOINT);
}

// 1. 단일 정본 상품 데이터베이스 (PRODUCTS_DATA)
// ※ 모델코드·제품명·사양·가격 전부 원본 단가표(원룸모델오피스텔.xlsx) 기준.
//    가격은 원본 시트의 "공급가"를 판매가로 사용. 원본에 없는 사양은 임의로 넣지 않음.
const PRODUCTS_DATA = [
    { model: "B182DS13", name: "LG 일반냉장고 189L 샤인실버", price: 380000, category: "냉장고", line: "일반냉장고", specs: "일반형 | 189L | 샤인실버", image: "refrigerator_189l_shine.png", tabs: ["oneroom", "all"] },
    { model: "B182W13", name: "LG 일반냉장고 189L 화이트", price: 480000, category: "냉장고", line: "일반냉장고", specs: "일반형 | 189L | 화이트", image: "refrigerator_189l_white.png", tabs: ["oneroom", "all"] },
    { model: "B053S14", name: "LG 일반냉장고 43L 화이트", price: 160000, category: "냉장고", line: "일반냉장고", specs: "1도어 | 43L | 화이트", image: "refrigerator_43l_shine.png", tabs: ["motel", "all"] },
    { model: "B053W14", name: "LG 일반냉장고 43L 샤인실버", price: 150000, category: "냉장고", line: "일반냉장고", specs: "1도어 | 43L | 샤인실버", image: "refrigerator_43l_white.png", tabs: ["motel", "all"] },
    { model: "M272PR35BL", name: "LG 빌트인 콤비냉장고 (좌경첩)", price: 670000, category: "냉장고", line: "빌트인 콤비냉장고", specs: "빌트인 콤비 | 좌경첩", image: "combi_m272pr35bl.png", tabs: ["officetel", "all"] },
    { model: "M272PR35BR", name: "LG 빌트인 콤비냉장고 (우경첩)", price: 670000, category: "냉장고", line: "빌트인 콤비냉장고", specs: "빌트인 콤비 | 우경첩", image: "combi_m272pr35br.png", tabs: ["officetel", "all"] },

    { model: "F9WTQ", name: "LG 빌트인 세탁기 9kg (일반·상판O)", price: 457000, category: "세탁기", line: "빌트인 세탁기", specs: "일반 세탁 | 9kg | 상판 있음", image: "washer_f9wtq.png", tabs: ["oneroom", "officetel", "all"] },
    { model: "F9WTBQ", name: "LG 빌트인 세탁기 9kg (일반·상판X)", price: 445000, category: "세탁기", line: "빌트인 세탁기", specs: "일반 세탁 | 9kg | 상판 없음", image: "washer_f9wtbq.png", tabs: ["oneroom", "officetel", "all"] },
    { model: "FY9WT", name: "LG 빌트인 세탁기 9kg (건조겸용·상판O)", price: 585000, category: "세탁기", line: "빌트인 세탁기", specs: "건조겸용 | 9kg | 상판 있음", image: "washer_fy9wt.png", tabs: ["oneroom", "officetel", "all"] },
    // ⚠ 원본 단가표 자체가 상이: 원룸 시트 575,000 / 오피스텔 시트 578,000 — 정본 확인 필요
    { model: "FY9WTB", name: "LG 빌트인 세탁기 9kg (건조겸용·상판X)", price: 575000, category: "세탁기", line: "빌트인 세탁기", specs: "건조겸용 | 9kg | 상판 없음", image: "washer_fy9wtb.png", tabs: ["oneroom", "officetel", "all"] },

    { model: "50NU850BXNA", name: "LG NANO 4K UHD AI TV", price: 450000, category: "TV", line: "NANO UHD", specs: "50인치 | NANO 4K UHD | AI", image: "tv_50nu850bxna.png", tabs: ["motel", "all"] },
    { model: "55QN1C70BKA", name: "LG QNED AI TV", price: 910000, category: "TV", line: "QNED", specs: "55인치 | QNED | AI", image: "tv_55qn1c70bka.png", tabs: ["motel", "all"] },
    { model: "65NA1C90AKA", name: "LG 나노셀 AI TV", price: 1085000, category: "TV", line: "나노셀", specs: "65인치 | 나노셀 | AI", image: "tv_65na1c90aka.png", tabs: ["motel", "all"] },
    { model: "75NA1C90AKA", name: "LG 나노셀 AI TV", price: 1330000, category: "TV", line: "나노셀", specs: "75인치 | 나노셀 | AI", image: "tv_75na1c90aka.png", tabs: ["motel", "all"] },
    { model: "86NA1C90AKA", name: "LG 나노셀 AI TV", price: 2185000, category: "TV", line: "나노셀", specs: "86인치 | 나노셀 | AI", image: "tv_86na1c90aka.png", tabs: ["motel", "all"] },

    { model: "BER2GE", name: "LG 빌트인 전기레인지 2구", price: 169000, category: "주방가전", line: "빌트인 전기레인지", specs: "빌트인 | 2구", image: "range_ber2ge.png", tabs: ["oneroom", "officetel", "all"] },
    { model: "MW20CDN", name: "LG 전자레인지 20L", price: 169000, category: "주방가전", line: "전자레인지", specs: "20L", image: "microwave_mw20cdn.png", tabs: ["oneroom", "officetel", "all"] },
    { model: "SQ06EZ1WBS", name: "LG 벽걸이 에어컨 6평형", price: 425000, category: "에어컨", line: "벽걸이 에어컨", specs: "6평 | 기본설치비 91,300원 별도", image: "aircon_sq06ez1wbs.png", tabs: ["oneroom", "all"] },
    { model: "AS105GWJC", name: "LG 공기청정기", price: 254150, category: "에어시스템", line: "공기청정기", specs: "세부 사양은 상담 시 확인", image: "air_purifier_as105gwjc.png", tabs: ["motel", "all"] },
    { model: "SC3GUE", name: "LG 스타일러 3벌 (메탈릭 차콜)", price: 1083000, category: "의류관리기", line: "스타일러", specs: "3벌 | 메탈릭 차콜", image: "styler_sc3gue.png", tabs: ["motel", "officetel", "all"] }
];

// Helper: 모델 코드로 단일 정본 상품 검색
function getProductByModel(modelCode) {
    return PRODUCTS_DATA.find(p => p.model === modelCode) || null;
}

// B-1: shop.html 카드 동적 렌더링 함수
function renderShopProducts(filterKeyword = '') {
    const tabContents = document.querySelectorAll('.tab-content');
    if (!tabContents.length) return;

    tabContents.forEach(tab => {
        const tabId = tab.id; // 'oneroom', 'motel', 'guesthouse', 'all'
        
        // 검색 필터링 (C-7 대응: 전체 탭에서 검색 가능하게)
        let filteredProducts = PRODUCTS_DATA.filter(p => p.tabs.includes(tabId));
        if (filterKeyword) {
            const kw = filterKeyword.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(kw) || p.model.toLowerCase().includes(kw)
            );
        }

        let html = '';
        if (filteredProducts.length === 0) {
            html = `<div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: #777;">해당 카테고리에 상품이 없습니다.</div>`;
        } else {
            filteredProducts.forEach(p => {
                html += `
                    <div class="product-card-wrap" data-model="${p.model}" data-price="${p.price}">
                        <div class="shop-prod-card" style="border: 1px solid #e5e5e5; border-radius: 8px; background: #fff; overflow: hidden; display: flex; flex-direction: column; height:100%;">
                            <div class="shop-prod-img-wrap" style="height: 200px; background: #f6f6f6; display: flex; align-items: center; justify-content: center;">
                                <img src="images/${p.image}" alt="${p.name} ${p.model}" style="max-width: 85%; max-height: 85%; object-fit: contain;" loading="lazy" width="200" height="200">
                            </div>
                            <div class="shop-prod-info" style="padding: 1.2rem; display: flex; flex-direction: column; flex-grow: 1;">
                                <span class="shop-prod-category" style="font-size: 0.75rem; color: var(--primary-color); font-weight: 700; margin-bottom: 0.4rem;">${p.category}</span>
                                <h3 class="card-title" style="font-size: 1rem; font-weight: 700; margin-bottom: 0.2rem;">${p.name}</h3>
                                <p class="shop-prod-model" style="font-size: 0.8rem; color: var(--text-light); margin-bottom: 0.6rem;">${p.model}</p>
                                <p class="shop-prod-spec" style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 1rem;">${p.specs}</p>
                                <div class="shop-prod-price-row">
                                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                                        <span style="font-size: 1.1rem; font-weight: 800; color: #111;">₩${p.price.toLocaleString()}</span>
                                        <span style="font-size:0.75rem; color:#777;">(VAT 포함)</span>
                                    </div>
                                    <button class="btn btn-primary btn-add-cart" data-model="${p.model}">담기</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        // Find or create grid container
        let gridContainer = tab.querySelector('.shop-grid');
        if (!gridContainer) {
            tab.innerHTML = `<div class="shop-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">${html}</div>`;
        } else {
            gridContainer.innerHTML = html;
        }
    });

    // Re-bind add to cart buttons
    bindAddToCartButtons();
}

// UI 토스트 알림 메시지 렌더러 (alert() 대체 - S-01, S-08)
function showToastMessage(message, type = 'success') {
    let toast = document.getElementById('global-toast-msg');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast-msg';
        toast.style.position = 'fixed';
        toast.style.bottom = '30px';
        toast.style.right = '30px';
        toast.style.padding = '1rem 1.5rem';
        toast.style.borderRadius = '8px';
        toast.style.color = '#fff';
        toast.style.fontSize = '0.95rem';
        toast.style.fontWeight = '600';
        toast.style.zIndex = '9999';
        toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.25)';
        toast.style.transition = 'transform 0.3s ease, opacity 0.3s ease, background-color 0.3s ease';
        document.body.appendChild(toast);
    }

    toast.style.backgroundColor = type === 'success' ? '#C6510D' : '#d9534f';
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
    }, 4500);
}

document.addEventListener('DOMContentLoaded', () => {
    // 2. 모바일 햄버거 내비게이션 토글 (S-04)
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mainNav = document.getElementById('main-nav');
    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            hamburgerBtn.classList.toggle('is-active');
            mainNav.classList.toggle('active');
            mainNav.classList.toggle('is-active');
            const isActive = mainNav.classList.contains('active');
            hamburgerBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });
    }

    // 3. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const header = document.getElementById('header');
                const headerHeight = header ? header.offsetHeight : 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // 모바일 닫기
                if (mainNav && mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    if (hamburgerBtn) hamburgerBtn.classList.remove('active');
                }
            }
        });
    });

    // 4. Product Carousel Logic
    const track = document.querySelector('.product-track');
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');
    
    if (track && prevBtn && nextBtn) {
        let scrollPosition = 0;
        const getScrollAmount = () => {
            const item = track.querySelector('.product-item');
            if (item) {
                const width = item.offsetWidth;
                const trackStyle = window.getComputedStyle(track);
                const gap = parseFloat(trackStyle.gap) || 0;
                return width + gap;
            }
            return 220;
        };

        nextBtn.addEventListener('click', () => {
            const amount = getScrollAmount();
            const maxScroll = track.scrollWidth - track.clientWidth;
            if (scrollPosition < maxScroll) {
                scrollPosition += amount;
                if (scrollPosition > maxScroll) scrollPosition = maxScroll;
                track.style.transform = `translateX(-${scrollPosition}px)`;
            }
        });

        prevBtn.addEventListener('click', () => {
            const amount = getScrollAmount();
            if (scrollPosition > 0) {
                scrollPosition -= amount;
                if (scrollPosition < 0) scrollPosition = 0;
                track.style.transform = `translateX(-${scrollPosition}px)`;
            }
        });

        window.addEventListener('resize', () => {
            scrollPosition = 0;
            track.style.transform = `translateX(0px)`;
        });
    }

    // 5. 30초 간편 견적 평가 (Quick Quote Evaluation) Logic & Modal (S-12, I-26, R-23)
    const diagModal = document.getElementById('diagModal');
    const openBtns = document.querySelectorAll('.open-diag-modal');
    const progressBar = document.getElementById('diagProgress');
    const steps = document.querySelectorAll('.diag-step');
    let currentStep = 1;

    let selectedPropertyType = '원룸';
    let selectedPyeong = 10;
    let selectedTier = '실속형';
    let currentRecommendation = null;

    // Property Type Selection Buttons
    const propBtns = document.querySelectorAll('.prop-type-btn');
    propBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            propBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedPropertyType = btn.getAttribute('data-type');
        });
    });

    // Pyeong Slider & Presets
    const pyeongRange = document.getElementById('pyeongRange');
    const pyeongValue = document.getElementById('pyeongValue');
    const pyeongPresets = document.querySelectorAll('.btn-pyeong-preset');

    function updatePyeong(val) {
        selectedPyeong = parseInt(val, 10);
        if (pyeongValue) pyeongValue.textContent = selectedPyeong;
        if (pyeongRange) pyeongRange.value = selectedPyeong;

        pyeongPresets.forEach(btn => {
            const presetVal = parseInt(btn.getAttribute('data-pyeong'), 10);
            if (presetVal === selectedPyeong) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    if (pyeongRange) {
        pyeongRange.addEventListener('input', (e) => updatePyeong(e.target.value));
    }

    pyeongPresets.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-pyeong');
            updatePyeong(val);
        });
    });

    // Recommendation Engine — 현장 형태 4종 × 평수 보정 × 실속형/프리미엄형 (R-23, C-3, C-4)
    // 추천 구성과 금액을 모두 PRODUCTS_DATA(원본 단가표) 기준으로 산출한다.
    const RECOMMENDATION_SETS = {
        '원룸': {
            standard: { fridge: 'B182DS13', washer: 'F9WTQ',  tv: '50NU850BXNA' },
            premium:  { fridge: 'M272PR35BL', washer: 'FY9WTB', tv: '55QN1C70BKA' },
            large:    { fridge: 'M272PR35BL', washer: 'FY9WT',  tv: '65NA1C90AKA' }
        },
        '호텔/모텔': {
            standard: { fridge: 'B053S14', washer: 'F9WTQ',  tv: '65NA1C90AKA' },
            premium:  { fridge: 'B053S14', washer: 'FY9WT',  tv: '75NA1C90AKA' },
            large:    { fridge: 'B053S14', washer: 'FY9WT',  tv: '86NA1C90AKA' }
        },
        '오피스텔': {
            standard: { fridge: 'B182DS13', washer: 'F9WTQ',  tv: '50NU850BXNA' },
            premium:  { fridge: 'B182W13', washer: 'FY9WT',  tv: '55QN1C70BKA' },
            large:    { fridge: 'M272PR35BL', washer: 'FY9WT',  tv: '65NA1C90AKA' }
        },
        '기타 상업공간': {
            standard: { fridge: 'B053S14', washer: 'F9WTQ',  tv: '55QN1C70BKA' },
            premium:  { fridge: 'M272PR35BL', washer: 'FY9WT',  tv: '75NA1C90AKA' },
            large:    { fridge: 'M272PR35BR', washer: 'FY9WT',  tv: '86NA1C90AKA' }
        }
    };

    function describeModel(modelCode) {
        const p = getProductByModel(modelCode);
        return p ? `${p.name} / ${p.model}` : modelCode;
    }

    function sumSetPrice(set) {
        return ['fridge', 'washer', 'tv'].reduce((sum, key) => {
            const p = getProductByModel(set[key]);
            return sum + (p ? p.price : 0);
        }, 0);
    }

    function calculateRecommendation(pyeong, propType) {
        const sets = RECOMMENDATION_SETS[propType] || RECOMMENDATION_SETS['원룸'];
        const stdSet = sets.standard;
        // 15평 이상이면 프리미엄 구성을 상위(large) 사양으로 보정
        const premSet = Number(pyeong) >= 15 ? sets.large : sets.premium;

        return {
            // 실속형
            fridge: describeModel(stdSet.fridge),
            washer: describeModel(stdSet.washer),
            tv: describeModel(stdSet.tv),
            standardModels: stdSet,
            priceStandard: '₩' + sumSetPrice(stdSet).toLocaleString() + ' (VAT 포함)',
            // 프리미엄형
            premFridge: describeModel(premSet.fridge),
            premWasher: describeModel(premSet.washer),
            premTv: describeModel(premSet.tv),
            premiumModels: premSet,
            pricePremium: '₩' + sumSetPrice(premSet).toLocaleString() + ' (VAT 포함)'
        };
    }

    function updateRecommendationProductImage(specId, modelCode) {
        const product = getProductByModel(modelCode);
        const icon = document.getElementById(specId)?.closest('.appliance-item')?.querySelector('.app-icon');
        if (!product || !icon) return;

        const image = document.createElement('img');
        image.src = `images/${product.image}`;
        image.alt = product.name;
        image.width = 56;
        image.height = 56;
        image.loading = 'lazy';
        icon.replaceChildren(image);
    }

    function setStep(stepNum) {
        currentStep = stepNum;
        steps.forEach((step, idx) => {
            if (idx + 1 === stepNum) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        if (progressBar) {
            const pct = (stepNum / 4) * 100;
            progressBar.style.width = `${pct}%`;
        }

        if (stepNum === 2) {
            currentRecommendation = calculateRecommendation(selectedPyeong, selectedPropertyType);
            const rStdTV = document.getElementById('rStdTV');
            const rStdFridge = document.getElementById('rStdFridge');
            const rStdWasher = document.getElementById('rStdWasher');
            const rStdPrice = document.getElementById('rStdPrice');

            const rPremTV = document.getElementById('rPremTV');
            const rPremFridge = document.getElementById('rPremFridge');
            const rPremWasher = document.getElementById('rPremWasher');
            const rPremPrice = document.getElementById('rPremPrice');

            if (rStdTV) rStdTV.textContent = currentRecommendation.tv;
            if (rStdFridge) rStdFridge.textContent = currentRecommendation.fridge;
            if (rStdWasher) rStdWasher.textContent = currentRecommendation.washer;
            if (rStdPrice) rStdPrice.textContent = currentRecommendation.priceStandard;

            if (rPremTV) rPremTV.textContent = currentRecommendation.premTv;
            if (rPremFridge) rPremFridge.textContent = currentRecommendation.premFridge;
            if (rPremWasher) rPremWasher.textContent = currentRecommendation.premWasher;
            if (rPremPrice) rPremPrice.textContent = currentRecommendation.pricePremium;

            updateRecommendationProductImage('rStdTV', currentRecommendation.standardModels.tv);
            updateRecommendationProductImage('rStdFridge', currentRecommendation.standardModels.fridge);
            updateRecommendationProductImage('rStdWasher', currentRecommendation.standardModels.washer);
            updateRecommendationProductImage('rPremTV', currentRecommendation.premiumModels.tv);
            updateRecommendationProductImage('rPremFridge', currentRecommendation.premiumModels.fridge);
            updateRecommendationProductImage('rPremWasher', currentRecommendation.premiumModels.washer);
        }
    }

    // Tier Cards Listener
    const tierCards = document.querySelectorAll('.tier-card');
    tierCards.forEach(card => {
        card.addEventListener('click', () => {
            tierCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedTier = card.getAttribute('data-tier');
        });
    });

    const btnGoToStep2 = document.getElementById('btnGoToStep2');
    if (btnGoToStep2) {
        btnGoToStep2.addEventListener('click', () => setStep(2));
    }

    const btnGoToContact = document.getElementById('btnGoToContact');
    if (btnGoToContact) {
        btnGoToContact.addEventListener('click', () => {
            if (!currentRecommendation) {
                currentRecommendation = calculateRecommendation(selectedPyeong, selectedPropertyType);
            }
            const chosenPrice = selectedTier === '실속형'
                ? currentRecommendation.priceStandard
                : currentRecommendation.pricePremium;

            const summaryProp = document.getElementById('summaryProp');
            const summarySpecs = document.getElementById('summarySpecs');
            const summaryTier = document.getElementById('summaryTier');

            if (summaryProp) summaryProp.textContent = `${selectedPropertyType} (${selectedPyeong}평)`;
            if (summarySpecs) summarySpecs.textContent = `TV (${currentRecommendation.tv}), 냉장고 (${currentRecommendation.fridge}), 세탁기 (${currentRecommendation.washer})`;
            if (summaryTier) summaryTier.textContent = `${selectedTier} (${chosenPrice})`;

            setStep(3);
        });
    }

    const btnBackToStep1 = document.getElementById('btnBackToStep1');
    if (btnBackToStep1) btnBackToStep1.addEventListener('click', () => setStep(1));
    const btnBackToStep2 = document.getElementById('btnBackToStep2');
    if (btnBackToStep2) btnBackToStep2.addEventListener('click', () => setStep(2));

    // Step 3 Quick Quote Final Submission (S-01, S-08)
    const quickQuoteFinalForm = document.getElementById('quickQuoteFinalForm');
    if (quickQuoteFinalForm) {
        quickQuoteFinalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('quickName')?.value || '';
            const phone = document.getElementById('quickPhone')?.value || '';
            const memo = document.getElementById('quickMemo')?.value || '';
            const consent = document.getElementById('quickConsent')?.checked;

            if (!consent) {
                showToastMessage('개인정보 수집 및 이용 동의가 필요합니다.', 'error');
                return;
            }

            const chosenPrice = selectedTier === '실속형'
                ? currentRecommendation.priceStandard
                : currentRecommendation.pricePremium;

            // A-1: Formspree 백엔드 연동
            const formData = new FormData();
            formData.append('name', name);
            formData.append('phone', phone);
            formData.append('memo', memo);
            formData.append('propertyType', selectedPropertyType);
            formData.append('pyeong', selectedPyeong);
            formData.append('tier', selectedTier);
            formData.append('recommendation_tv', currentRecommendation.tv);
            formData.append('recommendation_fridge', currentRecommendation.fridge);
            formData.append('recommendation_washer', currentRecommendation.washer);
            formData.append('formType', '30초 간편 견적');
            formData.append('_subject', '[더드림랩] 30초 간편 견적 신청');

            const submitBtn = quickQuoteFinalForm.querySelector('button[type="submit"]');
            if (!isFormEndpointConfigured()) {
                showToastMessage('온라인 접수 채널을 설정 중입니다. 대표전화 1544-3820 또는 itsceo@thedreamlab.co.kr로 문의해 주세요.', 'error');
                return;
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '접수 중...';
            }

            fetch(FORM_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    showToastMessage(`상담 신청이 정상적으로 입력되었습니다. B2B 전담 매니저가 유선으로 연락드리겠습니다.`, 'success');
                    const confProp = document.getElementById('confProp');
                    if (confProp) confProp.textContent = `${selectedPropertyType} (${selectedPyeong}평) - ${selectedTier}`;
                    setStep(4);
                } else {
                    showToastMessage('서버 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
                }
            }).catch(error => {
                showToastMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
            }).finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = '견적 신청 및 상담 예약하기';
                }
            });
        });
    }

    // Modal Triggers, focus trap, focus return & ESC Key (S-12, I-26)
    let lastFocusedElement = null;

    function getModalFocusableElements() {
        if (!diagModal) return [];
        return Array.from(diagModal.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )).filter(el => el.offsetParent !== null);
    }

    function closeDiagModal() {
        if (!diagModal) return;
        diagModal.classList.remove('active');
        diagModal.setAttribute('aria-hidden', 'true');
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
    }

    openBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setStep(1);
            if (diagModal) {
                lastFocusedElement = btn;
                diagModal.classList.add('active');
                diagModal.setAttribute('aria-hidden', 'false');
                const focusable = getModalFocusableElements();
                if (focusable[0]) focusable[0].focus();
            }
        });
    });

    const closeModalBtns = document.querySelectorAll('.close-modal-btn, #closeDiagModal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeDiagModal);
    });

    if (diagModal) {
        diagModal.addEventListener('click', (e) => {
            if (e.target === diagModal) {
                closeDiagModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!diagModal || !diagModal.classList.contains('active')) return;
        if (e.key === 'Escape') {
            closeDiagModal();
            return;
        }
        if (e.key === 'Tab') {
            const focusable = getModalFocusableElements();
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    // 6. Homepage Main Contact Form Submission (S-01, S-08)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const consent = contactForm.querySelector('input[type="checkbox"][required]');
            if (consent && !consent.checked) {
                showToastMessage('개인정보 수집 및 이용에 동의하셔야 상담 신청이 가능합니다.', 'error');
                return;
            }
            const name = document.getElementById('name')?.value || '고객';
            const phone = document.getElementById('phone')?.value || '';
            const company = document.getElementById('company')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const message = document.getElementById('message')?.value || '';
            
            const formData = new FormData();
            formData.append('name', name);
            formData.append('phone', phone);
            formData.append('company', company);
            formData.append('email', email);
            formData.append('message', message);
            formData.append('formType', '홈페이지 일반 문의');
            formData.append('_subject', '[더드림랩] 홈페이지 일반 문의');

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (!isFormEndpointConfigured()) {
                showToastMessage('온라인 접수 채널을 설정 중입니다. 대표전화 1544-3820 또는 itsceo@thedreamlab.co.kr로 문의해 주세요.', 'error');
                return;
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '제출 중...';
            }

            fetch(FORM_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    showToastMessage(`${name}님, 문의 내용이 접수되었습니다. 담당자가 확인 후 신속히 유선 연락드리겠습니다.`, 'success');
                    contactForm.reset();
                } else {
                    showToastMessage('서버 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
                }
            }).catch(error => {
                showToastMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
            }).finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = '문의 남기기';
                }
            });
        });
    }

    // 7. Shared Cart Logic (data-model based - S-05)
    window.updateCartCount = function() {
        try {
            const cart = JSON.parse(localStorage.getItem('dreamLabCart') || '[]');
            const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            document.querySelectorAll('.cart-count').forEach(el => {
                el.textContent = totalCount;
                el.hidden = totalCount === 0;
            });
        } catch (err) {
            console.error('Failed to update cart count:', err);
        }
    };

    window.updateCartCount();

    // Add to Cart Button Handlers
    window.bindAddToCartButtons = function() {
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            // Remove previous event listeners by replacing the node to avoid duplicates when re-rendering
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                const model = e.currentTarget.getAttribute('data-model');
                const product = getProductByModel(model);

                if (!product) return;

                try {
                    let cart = JSON.parse(localStorage.getItem('dreamLabCart') || '[]');
                    const existingItem = cart.find(item => item.model === model);
                    if (existingItem) {
                        existingItem.quantity = (existingItem.quantity || 1) + 1;
                        existingItem.price = product.price; // Dynamic price refresh (S-05)
                    } else {
                        cart.push({
                            model: product.model,
                            name: product.name,
                            price: product.price,
                            specs: product.specs,
                            image: product.image,
                            quantity: 1
                        });
                    }
                    localStorage.setItem('dreamLabCart', JSON.stringify(cart));
                    window.updateCartCount();
                    showToastMessage(`🛒 '${product.name}' 제품이 장바구니에 담겼습니다!`, 'success');
                } catch (err) {
                    console.error('Failed to add item to cart:', err);
                }
            });
        });
    };
    
    // Bind initially for non-shop pages that have hardcoded products
    window.bindAddToCartButtons();

    // 8. B2B Cart Page & Invoice Renderer (I-33, I-34, I-35)
    const cartTableBody = document.getElementById('cartTableBody');
    if (cartTableBody) {
        function numberToKorean(num) {
            const units = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
            const smallUnits = ["", "십", "백", "천"];
            const bigUnits = ["", "만", "억", "조"];
            if (num === 0) return "영";
            let result = "";
            let str = num.toString();
            let len = str.length;
            for (let i = 0; i < len; i++) {
                let digit = parseInt(str[len - 1 - i], 10);
                let pos = i % 4;
                let bigPos = Math.floor(i / 4);
                if (digit !== 0) {
                    let word = units[digit] + smallUnits[pos];
                    if (pos > 0 && digit === 1) word = smallUnits[pos];
                    result = word + result;
                }
                if (pos === 0 && bigPos > 0) {
                    let groupSum = 0;
                    for (let j = 0; j < 4; j++) {
                        let idx = len - 1 - (bigPos * 4 + j);
                        if (idx >= 0) groupSum += parseInt(str[idx], 10);
                    }
                    if (groupSum > 0) result = bigUnits[bigPos] + result;
                }
            }
            return result;
        }

        function renderCartPage() {
            let cart = [];
            try {
                cart = JSON.parse(localStorage.getItem('dreamLabCart') || '[]');
            } catch (e) {
                console.error(e);
            }

            const emptyMsg = document.querySelector('.empty-cart-msg');
            const tableWrap = document.querySelector('.table-responsive');

            if (cart.length === 0) {
                if (emptyMsg) emptyMsg.style.display = 'block';
                if (tableWrap) tableWrap.style.display = 'none';
                updateTotals(0);
                return;
            }

            if (emptyMsg) emptyMsg.style.display = 'none';
            if (tableWrap) tableWrap.style.display = 'block';

            cartTableBody.innerHTML = '';
            cart.forEach(item => {
                const product = getProductByModel(item.model) || item;
                const subtotal = parseInt(product.price, 10) * item.quantity;

                cartTableBody.innerHTML += `
                    <tr data-model="${item.model}">
                        <td style="padding: 1rem 0.5rem;">
                            ${product.image ? `<img src="${product.image.startsWith('images/') ? product.image : 'images/' + product.image}" class="cart-item-img" alt="${product.name}">` : `<div class="cart-item-img" style="background:#f5f5f5; display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:#aaa; text-align:center;">No Image</div>`}
                        </td>
                        <td style="padding: 1rem 0.5rem;">
                            <div style="font-weight: 700; color: #222; font-size: 0.95rem;">${product.name}</div>
                            <div style="font-size: 0.8rem; color: #777; margin-top: 0.2rem;">모델명: ${item.model} | ${product.specs || ''}</div>
                        </td>
                        <td class="text-right" style="padding: 1rem 0.5rem; font-weight: 600;">₩${parseInt(product.price, 10).toLocaleString()}</td>
                        <td class="text-center" style="padding: 1rem 0.5rem;">
                            <input type="number" min="1" max="999" class="quantity-input" value="${item.quantity}" data-model="${item.model}">
                        </td>
                        <td class="text-right subtotal-cell" style="padding: 1rem 0.5rem; font-weight: 700; color: #111;">₩${subtotal.toLocaleString()}</td>
                        <td class="text-center" style="padding: 1rem 0.5rem;">
                            <button class="btn-delete" data-model="${item.model}" aria-label="상품 삭제" style="min-width:44px; min-height:44px; font-size: 1.2rem;">×</button>
                        </td>
                    </tr>
                `;
            });

            bindCartEvents();
            calculateCartTotals();
        }

        function bindCartEvents() {
            document.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    let val = parseInt(e.target.value, 10);
                    if (isNaN(val) || val < 1) val = 1;
                    e.target.value = val;

                    const model = e.target.getAttribute('data-model');
                    let cart = JSON.parse(localStorage.getItem('dreamLabCart') || '[]');
                    const targetItem = cart.find(item => item.model === model);
                    if (targetItem) {
                        targetItem.quantity = val;
                        localStorage.setItem('dreamLabCart', JSON.stringify(cart));
                        updateCartCount();
                        
                        const product = getProductByModel(model) || targetItem;
                        const subtotal = parseInt(product.price, 10) * val;
                        const row = e.target.closest('tr');
                        if (row) {
                            const subtotalCell = row.querySelector('.subtotal-cell');
                            if (subtotalCell) subtotalCell.textContent = `₩${subtotal.toLocaleString()}`;
                        }
                        calculateCartTotals();
                    }
                });
            });

            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const model = e.currentTarget.getAttribute('data-model');
                    let cart = JSON.parse(localStorage.getItem('dreamLabCart') || '[]');
                    cart = cart.filter(item => item.model !== model);
                    localStorage.setItem('dreamLabCart', JSON.stringify(cart));
                    updateCartCount();
                    renderCartPage();
                });
            });
        }

        function calculateCartTotals() {
            let cart = JSON.parse(localStorage.getItem('dreamLabCart') || '[]');
            let total = 0;
            let totalItems = 0;
            cart.forEach(item => {
                const product = getProductByModel(item.model) || item;
                total += parseInt(product.price, 10) * item.quantity;
                totalItems += item.quantity;
            });
            updateTotals(total, totalItems);
        }

        function updateTotals(total, totalItems = 0) {
            const subtotalVal = Math.round(total / 1.1);
            const taxVal = total - subtotalVal;

            const summaryTotalItems = document.getElementById('summaryTotalItems');
            const summarySubtotal = document.getElementById('summarySubtotal');
            const summaryTax = document.getElementById('summaryTax');
            const summaryTotal = document.getElementById('summaryTotal');

            if (summaryTotalItems) summaryTotalItems.textContent = `${totalItems}개`;
            if (summarySubtotal) summarySubtotal.textContent = `₩${subtotalVal.toLocaleString()}`;
            if (summaryTax) summaryTax.textContent = `₩${taxVal.toLocaleString()}`;
            if (summaryTotal) summaryTotal.textContent = `₩${total.toLocaleString()}`;
            
            renderInvoice(total);
        }

        function renderInvoice(totalSum) {
            let cart = JSON.parse(localStorage.getItem('dreamLabCart') || '[]');
            const companyName = document.getElementById('cartCompany')?.value || '________';
            const ceoName = document.getElementById('cartCEO')?.value || '________';
            const phoneNum = document.getElementById('cartPhone')?.value || '________';
            const selectedType = document.querySelector('input[name="b2b_type"]:checked')?.value || '원룸 / 오피스텔';
            const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

            const elCompany = document.getElementById('printClientCompany');
            const elCEO = document.getElementById('printClientCEO');
            const elPhone = document.getElementById('printClientPhone');
            const elType = document.getElementById('printClientType');
            const elDate = document.getElementById('printDate');

            if (elCompany) elCompany.textContent = companyName;
            if (elCEO) elCEO.textContent = ceoName;
            if (elPhone) elPhone.textContent = phoneNum;
            if (elType) elType.textContent = selectedType;
            if (elDate) elDate.textContent = today;

            const printInvoiceBody = document.getElementById('printInvoiceBody');
            if (printInvoiceBody) {
                printInvoiceBody.innerHTML = '';
                cart.forEach((item, index) => {
                    const product = getProductByModel(item.model) || item;
                    const subtotal = parseInt(product.price, 10) * item.quantity;

                    printInvoiceBody.innerHTML += `
                        <tr>
                            <td style="text-align: center; border: 1px solid #000; padding: 8px;">${index + 1}</td>
                            <td style="border: 1px solid #000; padding: 8px;"><strong>${product.name}</strong><br><span style="font-size:0.8rem; color:#555;">${product.specs || ''}</span></td>
                            <td style="text-align: center; border: 1px solid #000; padding: 8px;">${item.model}</td>
                            <td style="text-align: right; border: 1px solid #000; padding: 8px;">${parseInt(product.price, 10).toLocaleString()}</td>
                            <td style="text-align: center; border: 1px solid #000; padding: 8px;">${item.quantity}</td>
                            <td style="text-align: right; border: 1px solid #000; padding: 8px;">${subtotal.toLocaleString()}</td>
                        </tr>
                    `;
                });
            }

            const subtotalVal = Math.round(totalSum / 1.1);
            const taxVal = totalSum - subtotalVal;

            const elSubtotal = document.getElementById('printSubtotal');
            const elTax = document.getElementById('printTax');
            const elGrandTotal = document.getElementById('printGrandTotal');
            if (elSubtotal) elSubtotal.textContent = subtotalVal.toLocaleString();
            if (elTax) elTax.textContent = taxVal.toLocaleString();
            if (elGrandTotal) elGrandTotal.textContent = totalSum.toLocaleString();
        }

        ['cartCompany', 'cartCEO', 'cartPhone'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => calculateCartTotals());
            }
        });

        // Print Estimate Button
        const btnPrint = document.getElementById('btnPrintEstimate');
        if (btnPrint) {
            btnPrint.addEventListener('click', () => {
                const company = document.getElementById('cartCompany')?.value;
                const ceo = document.getElementById('cartCEO')?.value;
                const phone = document.getElementById('cartPhone')?.value;
                if (!company || !ceo || !phone) {
                    showToastMessage('견적서 출력을 위해 사업장 정보(상호, 대표자, 연락처)를 모두 입력해주세요.', 'error');
                    return;
                }
                window.print();
            });
        }

        // Cart Consult Submission Form (S-01, S-08)
        const cartConsultForm = document.getElementById('cart-consult-form');
        if (cartConsultForm) {
            cartConsultForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const consent = cartConsultForm.querySelector('input[name="privacy_consent"]');
                if (consent && !consent.checked) {
                    showToastMessage('개인정보 수집 및 이용에 동의하셔야 상담 제출이 가능합니다.', 'error');
                    return;
                }
                const company = document.getElementById('cartCompany')?.value || '';
                const ceo = document.getElementById('cartCEO')?.value || '';
                const phone = document.getElementById('cartPhone')?.value || '';
                const email = document.getElementById('cartEmail')?.value || '';
                const businessType = document.querySelector('input[name="b2b_type"]:checked')?.value || '';
                let cart = [];
                try {
                    cart = JSON.parse(localStorage.getItem('dreamLabCart') || '[]');
                } catch (error) {
                    console.error(error);
                }
                const quoteItems = cart.map(item => {
                    const product = getProductByModel(item.model) || item;
                    const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
                    const unitPrice = parseInt(product.price, 10) || 0;
                    return {
                        model: item.model,
                        name: product.name || '',
                        unitPrice,
                        quantity,
                        lineTotal: unitPrice * quantity
                    };
                });
                const quoteTotal = quoteItems.reduce((sum, item) => sum + item.lineTotal, 0);
                const quoteSupplyAmount = Math.round(quoteTotal / 1.1);
                const quoteVat = quoteTotal - quoteSupplyAmount;
                
                const formData = new FormData();
                formData.append('company', company);
                formData.append('ceo', ceo);
                formData.append('phone', phone);
                formData.append('email', email);
                formData.append('businessType', businessType);
                formData.append('itemCount', String(quoteItems.reduce((sum, item) => sum + item.quantity, 0)));
                formData.append('supplyAmount', quoteSupplyAmount.toLocaleString());
                formData.append('vat', quoteVat.toLocaleString());
                formData.append('grandTotal', quoteTotal.toLocaleString());
                formData.append('formType', '장바구니 견적 문의');
                formData.append('_subject', '[더드림랩] 장바구니 견적 문의');
                formData.append('cartItems', JSON.stringify(quoteItems));
                
                const submitBtn = cartConsultForm.querySelector('button[type="submit"]');
                if (!isFormEndpointConfigured()) {
                showToastMessage('온라인 접수 채널을 설정 중입니다. 대표전화 1544-3820 또는 itsceo@thedreamlab.co.kr로 문의해 주세요.', 'error');
                    return;
                }
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = '제출 중...';
                }

                fetch(FORM_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                }).then(response => {
                    if (response.ok) {
                        showToastMessage(`[접수 완료] ${company} (${ceo} 대표님), 견적 문의가 접수되었습니다. 유선으로 상세 안내해 드리겠습니다.`, 'success');
                        localStorage.setItem('dreamLabCart', '[]');
                        renderCartPage();
                        updateCartCount();
                        cartConsultForm.reset();
                    } else {
                        showToastMessage('서버 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
                    }
                }).catch(error => {
                    showToastMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
                }).finally(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = '견적서 및 상담 요청하기';
                    }
                });
            });
        }

        renderCartPage();
    }

    // 9. Shop Page Filters, Deep-linking & Realtime Search (I-20, I-38, R-18, C-7, C-8)
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // B-1: Initial Render of all products if we are on shop.html
    if (tabContents.length > 0) {
        renderShopProducts();
    }

    if (tabButtons.length > 0 && tabContents.length > 0) {
        function activateTab(targetTab) {
            const validTarget = document.getElementById(targetTab) ? targetTab : 'all';
            tabButtons.forEach(b => {
                const selected = b.getAttribute('data-tab') === validTarget;
                b.classList.toggle('active', selected);
                b.setAttribute('aria-selected', selected ? 'true' : 'false');
                b.setAttribute('tabindex', selected ? '0' : '-1');
            });
            tabContents.forEach(c => {
                const selected = c.id === validTarget;
                c.classList.toggle('active', selected);
                c.hidden = !selected;
            });
            return validTarget;
        }

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                const activeTarget = activateTab(targetTab);
                // Update URL Hash (I-20)
                window.location.hash = activeTarget;
            });

            btn.addEventListener('keydown', (e) => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
                e.preventDefault();
                const buttons = Array.from(tabButtons);
                const currentIndex = buttons.indexOf(btn);
                let nextIndex = currentIndex;
                if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % buttons.length;
                if (e.key === 'Home') nextIndex = 0;
                if (e.key === 'End') nextIndex = buttons.length - 1;
                const nextBtn = buttons[nextIndex];
                const activeTarget = activateTab(nextBtn.getAttribute('data-tab'));
                window.location.hash = activeTarget;
                nextBtn.focus();
            });
        });

        // Hash Deep-link check on load (I-20)
        const initialHash = window.location.hash.replace('#', '');
        if (initialHash) {
            activateTab(initialHash);
        }

        // C-8: 뒤로가기(hashchange) 연동
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) activateTab(hash);
        });
    }

    // Realtime Search & Sort in Shop Page (R-18, C-7)
    const searchInput = document.getElementById('product-search-input');
    const sortSelect = document.getElementById('product-sort-select');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            // C-7: 검색 시 전체 탭을 대상으로 다시 렌더링
            renderShopProducts(query);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortMode = e.target.value;
            const activeTabContent = document.querySelector('.tab-content.active');
            if (!activeTabContent) return;

            const grid = activeTabContent.querySelector('.shop-grid');
            if (!grid) return;

            const cards = Array.from(grid.querySelectorAll('.product-card-wrap'));
            cards.sort((a, b) => {
                const priceA = parseInt(a.getAttribute('data-price') || '0', 10);
                const priceB = parseInt(b.getAttribute('data-price') || '0', 10);
                if (sortMode === 'price-low') return priceA - priceB;
                if (sortMode === 'price-high') return priceB - priceA;
                return 0; // default
            });

            cards.forEach(card => grid.appendChild(card));
        });
    }

    // Radio button active state synchronization (b2b_type selector)
    document.querySelectorAll('input[name="b2b_type"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.b2b-radio-label').forEach(lbl => lbl.classList.remove('active'));
            if (radio.checked) {
                const parentLabel = radio.closest('.b2b-radio-label');
                if (parentLabel) parentLabel.classList.add('active');
            }
        });
    });
});

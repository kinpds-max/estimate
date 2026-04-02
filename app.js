// Hasnol Estimate App Logic

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const customerNameIpt = document.getElementById('customerName');
    const customerPhoneIpt = document.getElementById('customerPhone');
    const customerRegionIpt = document.getElementById('customerRegion');
    const customerAptIpt = document.getElementById('customerApt');
    const customerSizeIpt = document.getElementById('customerSize');
    const customerScopeIpt = document.getElementById('customerScope');
    const customerTendencySel = document.getElementById('customerTendency');

    const matSizeSel = document.getElementById('matSize');
    const matTypeSel = document.getElementById('matType');
    
    // New Multi-Space Elements
    const spacesContainer = document.getElementById('spacesContainer');
    const addSpaceBtn = document.getElementById('addSpaceBtn');

    const pricePerMatIpt = document.getElementById('pricePerMat');
    const discountPerMatIpt = document.getElementById('discountPerMat');
    const groupPurchaseTier = document.getElementById('groupPurchaseTier');
    const extraDiscountTier = document.getElementById('extraDiscountTier');
    const referralCountIpt = document.getElementById('referralCount');
    const regionDeliveryChk = document.getElementById('regionDelivery');
    const reinstallChk = document.getElementById('reinstallChk');

    const reviewCashChk = document.getElementById('reviewCash');
    const reviewEventChk = document.getElementById('reviewEvent');
    const calculateBtn = document.getElementById('calculateBtn');

    const resQty = document.getElementById('resQty');
    const resTotal = document.getElementById('resTotal');
    const sketchPad = document.getElementById('sketchPad');

    const appliedUnitPriceBox = document.getElementById('appliedUnitPrice');
    const valAppliedPrice = document.getElementById('valAppliedPrice');

    const infoBasePrice = document.getElementById('infoBasePrice');
    const infoSpecialDiscount = document.getElementById('infoSpecialDiscount');
    const infoAddDiscount = document.getElementById('infoAddDiscount');
    const infoInstallFee = document.getElementById('infoInstallFee');
    const infoFinalPrice = document.getElementById('infoFinalPrice');

    const contractBuyer = document.getElementById('contractBuyerName');
    const contractBuyerPhone = document.getElementById('contractBuyerPhone');
    const contractBuyerLocation = document.getElementById('contractBuyerLocation');
    const contractBuyerSize = document.getElementById('contractBuyerSize');
    const contractBuyerScope = document.getElementById('contractBuyerScope');
    
    const contractTotal = document.getElementById('infoFinalPrice'); // Link to the same summary span for consistency

    // Pricing Data
    const pricingMatrix = {
        '600': { standard: [29000, 25000], leather: [29000, 25000] },
        '800': { standard: [80000, 47000], leather: [90000, 60000] },
        '1000': { standard: [130000, 95000], leather: [130000, 95000] },
        '1200': { leather: [200000, 150000] } // Leather only as requested
    };

    // Quick Preset Logic
    const homePresets = document.getElementById('homePresets');
    const residentialGrid = document.getElementById('residentialGrid');
    const commercialGrid = document.getElementById('commercialGrid');
    const facilityRadios = document.querySelectorAll('input[name="facilityType"]');
    const presetBtns = document.querySelectorAll('.preset-btn');
    let activePresetQty600 = null;

    facilityRadios.forEach(radio => {
        radio.parentElement.addEventListener('click', () => {
            facilityRadios.forEach(r => r.parentElement.classList.remove('active'));
            radio.parentElement.classList.add('active');
            radio.checked = true;
            
            if (radio.value === 'home') {
                residentialGrid.style.display = 'grid';
                commercialGrid.style.display = 'none';
            } else {
                residentialGrid.style.display = 'none';
                commercialGrid.style.display = 'grid';
            }
            activePresetQty600 = null;
            presetBtns.forEach(b => b.classList.remove('active'));
            calculateEstimate();
        });
    });

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activePresetQty600 = parseInt(btn.dataset.qty);
            calculateEstimate();
        });
    });

    // Event Listeners - Assigned before logic starts to ensure reliability
    if (calculateBtn) calculateBtn.addEventListener('click', () => {
        activePresetQty600 = null; // Manual calculation requested
        presetBtns.forEach(b => b.classList.remove('active'));
        calculateEstimate();
    });
    if (customerNameIpt) customerNameIpt.addEventListener('input', updateContract);
    if (customerPhoneIpt) customerPhoneIpt.addEventListener('input', updateContract);
    if (customerRegionIpt) customerRegionIpt.addEventListener('input', updateContract);
    if (customerAptIpt) customerAptIpt.addEventListener('input', updateContract);
    if (customerSizeIpt) customerSizeIpt.addEventListener('input', updateContract);
    if (customerScopeIpt) customerScopeIpt.addEventListener('input', updateContract);
    if (customerTendencySel) customerTendencySel.addEventListener('change', calculateEstimate);
    // CRM Dropdowns and Checkboxes Instant Bindings
    if (groupPurchaseTier) groupPurchaseTier.addEventListener('change', calculateEstimate);
    if (extraDiscountTier) extraDiscountTier.addEventListener('change', calculateEstimate);
    if (reviewCashChk) reviewCashChk.addEventListener('change', calculateEstimate);
    if (reviewEventChk) reviewEventChk.addEventListener('change', calculateEstimate);
    if (regionDeliveryChk) regionDeliveryChk.addEventListener('change', calculateEstimate);
    if (reinstallChk) reinstallChk.addEventListener('change', calculateEstimate);

    if (matSizeSel) matSizeSel.addEventListener('change', updateBasePrice);
    if (matTypeSel) matTypeSel.addEventListener('change', updateBasePrice);
    
    // Fixed: Ensure the button listener is active and direct
    if (addSpaceBtn) {
        addSpaceBtn.onclick = (e) => {
            e.preventDefault();
            addSpaceEntry();
        };
    }

    lucide.createIcons();

    // Initial State
    updateContract();
    updateBasePrice();
    
    // Ensure all space items (including initial one) have listeners
    document.querySelectorAll('.space-item').forEach(item => {
        item.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', calculateEstimate);
        });
    });

    if (document.querySelectorAll('.space-item').length === 0) {
        addSpaceEntry();
    }

    // Live update when manual discounts in the table change
    document.querySelectorAll('.manual-discount').forEach(ipt => {
        ipt.addEventListener('input', calculateEstimate);
    });

    // --- Specification Tab & Recommendation Control ---
    window.selectModel = function(size, type) {
        // Update hidden inputs
        matSizeSel.value = size;
        matTypeSel.value = type;

        // Update UI Tabs
        document.querySelectorAll('.spec-tab').forEach(tab => {
            if (tab.dataset.size === size && tab.dataset.type === type) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update UI Chips (Recommendations)
        document.querySelectorAll('.recommend-chip').forEach(chip => {
            chip.classList.remove('active');
        });

        // Sync main engine
        updateBasePrice();
        calculateEstimate();
        updateContract();
        lucide.createIcons();
    };

    // Attach click events to specification tabs
    document.querySelectorAll('.spec-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            selectModel(tab.dataset.size, tab.dataset.type);
        });
    });

    if (addSpaceBtn) addSpaceBtn.onclick = (e) => {
        e.preventDefault();
        addSpaceEntry();
    };

    // Space Management Logic
    window.toggleCustomSpace = function(select) {
        const customInput = select.nextElementSibling;
        if (select.value === 'etc') {
            customInput.style.display = 'block';
            customInput.focus();
        } else {
            customInput.style.display = 'none';
        }
        calculateEstimate();
    };

    function addSpaceEntry() {
        const div = document.createElement('div');
        div.className = 'space-item card animate-in';
        div.style = 'padding: 20px; background: #fff; border: 1px solid #eef2ff; margin-bottom: 20px; position: relative; border-radius: 12px; box-shadow: var(--shadow-soft);';
        div.innerHTML = `
            <button class="remove-btn" style="position: absolute; top: 15px; right: 15px; border: none; background: #f1f3f5; color: #adb5bd; border-radius: 8px; padding: 5px 10px; cursor: pointer; font-size: 14px; transition: all 0.2s;">제거 ✕</button>
            <div style="display: grid; grid-template-columns: 140px 1fr 1fr; gap: 20px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label>공간 구분</label>
                <select class="space-type" onchange="toggleCustomSpace(this)">
                  <option value="living">거실</option>
                  <option value="hallway">복도</option>
                  <option value="kitchen">주방</option>
                  <option value="room1">방 1</option>
                  <option value="room2">방 2</option>
                  <option value="room3">방 3</option>
                  <option value="alpha">알파룸</option>
                  <option value="etc">직접 입력 (기타)</option>
                </select>
                <input type="text" class="custom-space-name" placeholder="공간명 직접 입력 (예: 펫룸, 펜트하우스)" style="display: none; margin-top: 10px; font-size: 0.9rem; padding: 10px 14px; border: 1.5px solid var(--primary); border-radius: 10px; box-shadow: 0 0 10px rgba(10, 84, 247, 0.1); width: calc(100% - 28px);">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label>가로 (cm)</label>
                <input type="number" class="space-width" placeholder="실측 cm" style="border-radius: 8px;">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label>세로 (cm)</label>
                <input type="number" class="space-height" placeholder="실측 cm" style="border-radius: 8px;">
              </div>
            </div>
        `;
        
        // Remove Functionality
        const removeBtn = div.querySelector('.remove-btn');
        removeBtn.onmouseenter = () => { removeBtn.style.background = '#ff7675'; removeBtn.style.color = '#fff'; };
        removeBtn.onmouseleave = () => { removeBtn.style.background = '#f1f3f5'; removeBtn.style.color = '#adb5bd'; };
        removeBtn.addEventListener('click', () => {
            div.remove();
            calculateEstimate();
        });

        // Auto-calc on dimension change
        div.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', calculateEstimate);
        });
        
        spacesContainer.appendChild(div);
    }

    function updateBasePrice() {
        const size = matSizeSel.value;
        const type = matTypeSel.value;
        const [originalPrice, groupPrice] = pricingMatrix[size][type];
        
        // Sync Dropdown to Analysis Tab (Pulse-Sync left selections to right AI Engine)
        const typeShort = type === 'leather' ? 'lea' : 'std';
        const tabId = `${size}_${typeShort}`;
        const targetTab = document.querySelector(`.analysis-tab[data-id="${tabId}"]`);
        
        if (targetTab && !targetTab.classList.contains('active')) {
            document.querySelectorAll('.analysis-tab').forEach(btn => {
                btn.classList.remove('active');
                btn.style.background = 'white';
                btn.style.color = 'var(--text-main)';
                btn.style.fontWeight = '700';
            });
            targetTab.classList.add('active');
            targetTab.style.background = 'var(--primary)';
            targetTab.style.color = 'white';
            targetTab.style.fontWeight = '800';
        }
        
        // Show Original Price as base
        pricePerMatIpt.value = originalPrice;
        
        // Automatically calculate and show the Group Discount amount per sheet
        const discountAmt = originalPrice - groupPrice;
        discountPerMatIpt.value = discountAmt;
        
        appliedUnitPriceBox.style.display = 'none';
        
        // Auto-calculate to update visualizations if values change
        calculateEstimate();
    }

    function updateContract() {
        const name = customerNameIpt.value || '__________';
        const phone = customerPhoneIpt.value || '_________________';
        
        const region = customerRegionIpt.value || '';
        const apt = customerAptIpt.value || '';
        const locationStr = [region, apt].filter(Boolean).join(' ') || '_________________';
        
        const cSize = customerSizeIpt.value || '____';
        const cScope = customerScopeIpt.value || '_________________';

        if(contractBuyer) contractBuyer.textContent = name;
        if(contractBuyerPhone) contractBuyerPhone.textContent = phone;
        if(contractBuyerLocation) contractBuyerLocation.textContent = locationStr;
        if(contractBuyerSize) contractBuyerSize.textContent = cSize;
        if(contractBuyerScope) contractBuyerScope.textContent = cScope;
    }

    function calculateEstimate() {
        const sizeKey = matSizeSel.value;
        const typeKey = matTypeSel.value;
        const matSizeCm = parseFloat(sizeKey) / 10; 
        
        const spaceItems = document.querySelectorAll('.space-item');
        let totalQty = 0;
        let validSpaces = 0;
        let spacesData = [];

        const typeMap = {
            'living': '거실', 'hallway': '복도', 'kitchen': '주방', 
            'room1': '방 1', 'room2': '방 2', 'room3': '방 3', 'room4': '방 4', 'room5': '방 5',
            'alpha': '알파룸', 'etc': '기타'
        };

        let finalTotalQty = 0;
        let isPresetMode = false;

        if (activePresetQty600) {
            isPresetMode = true;
            // Apply size scaling provided by user: 800:56%, 1000:36%, 1200:25%
            let scaleFactor = 1.0;
            if (sizeKey === '800') scaleFactor = 0.56;
            else if (sizeKey === '1000') scaleFactor = 0.36;
            else if (sizeKey === '1200') scaleFactor = 0.25;
            
            finalTotalQty = Math.ceil(activePresetQty600 * scaleFactor);
        } else {
            spaceItems.forEach(item => {
                const w = parseFloat(item.querySelector('.space-width').value);
                const h = parseFloat(item.querySelector('.space-height').value);
                const typeSel = item.querySelector('.space-type');
                const customName = item.querySelector('.custom-space-name').value;
                
                let typeName = typeMap[typeSel.value] || '공간';
                if (typeSel.value === 'etc' && customName) {
                    typeName = customName;
                }
                
                if (w > 0 && h > 0) {
                    const cols = Math.ceil(w / matSizeCm);
                    const rows = Math.ceil(h / matSizeCm);
                    totalQty += (cols * rows);
                    validSpaces++;
                    spacesData.push({
                        typeName: typeName,
                        w: w, h: h,
                        cols: cols, rows: rows
                    });
                }
            });
            if (validSpaces === 0) return;
            finalTotalQty = totalQty;
        }

        const manualDiscounts = {};
        document.querySelectorAll('.manual-discount').forEach(ipt => {
            const size = ipt.dataset.size;
            const type = ipt.dataset.type;
            if (!manualDiscounts[size]) manualDiscounts[size] = {};
            const val = parseInt(ipt.value) || 0;
            manualDiscounts[size][type] = val;

            // Live Update the table's "Final Price" column
            const finalSpan = document.querySelector(`.price-row-final[data-size="${size}"][data-type="${type}"]`);
            if (finalSpan) {
                const basePriceArray = pricingMatrix[size][type] || pricingMatrix[size]['standard'] || pricingMatrix[size]['leather'];
                if (basePriceArray) {
                    const finalUnit = Math.max(0, basePriceArray[0] - val);
                    finalSpan.textContent = finalUnit.toLocaleString();
                }
            }
        });

        function getDiscountFor(size, type) {
            if (manualDiscounts[size]) {
                if (manualDiscounts[size][type] !== undefined) return manualDiscounts[size][type];
                if (manualDiscounts[size]['all'] !== undefined) return manualDiscounts[size]['all'];
            }
            return 0;
        }

        // Special case: 1200 is Leather only
        if (sizeKey === '1200' && typeKey === 'standard') {
            matTypeSel.value = 'leather';
            // updateBasePrice() calls calculateEstimate(), so we stop here to avoid recursion
            updateBasePrice();
            return;
        }

        const basePrices = pricingMatrix[sizeKey][typeKey];
        if (!basePrices) {
            console.warn('Pricing not found for:', sizeKey, typeKey);
            return;
        }

        const [originalPrice, promoPrice] = basePrices;
        const totalQtyWithSpare = finalTotalQty; // Spare physically disconnected per latest business rule
        
        // 1. Mat-unit Discounts
        let unitDiscount = parseInt(groupPurchaseTier.value || 0) + 
                           parseInt(extraDiscountTier.value || 0) + 
                           (reviewCashChk && reviewCashChk.checked ? 1000 : 0);
        
        // 2. Flat Discounts
        const refCount = parseInt(referralCountIpt.value || 0);
        // Exclusivity: Group discount prevents Referral discount
        const referralDiscountFlat = (parseInt(groupPurchaseTier.value) === 0) ? (refCount * 50000) : 0;
        const eventDiscountFlat = (reviewEventChk && reviewEventChk.checked ? 30000 : 0);
        const totalFlatDiscount = referralDiscountFlat + eventDiscountFlat;

        // 3. Fees and Logistics
        let installFee = 0;
        if (totalQtyWithSpare < 40) installFee = 200000;
        else if (totalQtyWithSpare < 70) installFee = 100000;
        else installFee = 0;

        const deliveryFee = (regionDeliveryChk && regionDeliveryChk.checked ? 100000 : 0);
        const totalFees = installFee + deliveryFee;

        // --- Final Price Assembly ---
        const baseTotal = totalQtyWithSpare * originalPrice;
        const discountPriceDiff = (originalPrice - promoPrice); // Basic system discount
        
        const systemDiscountTotal = totalQtyWithSpare * discountPriceDiff;
        const extraDiscountTotal = (totalQtyWithSpare * unitDiscount) + totalFlatDiscount;
        
        const finalPrice = Math.max(0, baseTotal - systemDiscountTotal - extraDiscountTotal + totalFees);

        // Update Result Summary UI
        const modelNameDisplay = document.getElementById('resModelName');
        const headerModelNameDisplay = document.getElementById('headerModelName');
        const activeName = `${sizeKey} ${typeKey === 'leather' ? '레더' : '표준'} 적용 중`;
        
        if (modelNameDisplay) {
            modelNameDisplay.textContent = activeName;
        }
        if (headerModelNameDisplay) {
            headerModelNameDisplay.textContent = activeName;
        }
        
        if (resTotal) resTotal.textContent = finalPrice.toLocaleString();

        // --- UI Feedback ---
        if (unitDiscount > 0) {
            appliedUnitPriceBox.style.display = 'block';
            valAppliedPrice.textContent = (promoPrice - unitDiscount).toLocaleString();
        } else {
            appliedUnitPriceBox.style.display = 'none';
        }

        if (isPresetMode) {
            resQty.innerHTML = `${totalQtyWithSpare.toLocaleString()}<small style="font-size: 0.8rem; font-weight: 300; display: block; margin-top: 5px; color: var(--secondary);">표준 권장 총량 (시공 편차 10장 내외 발생가능)</small>`;
        } else {
            resQty.innerHTML = `${totalQtyWithSpare.toLocaleString()}<small style="font-size: 0.8rem; font-weight: 300; display: block; margin-top: 5px; color: var(--secondary);">정밀 실측 수량 (시공 편차 10장 내외 발생가능)</small>`;
        }
        
        resTotal.innerHTML = `${finalPrice.toLocaleString()}<small style="font-size: 1rem; font-weight: 300;"> 원</small>`;

        // Breakdown Info Section
        infoBasePrice.textContent = baseTotal.toLocaleString();
        infoSpecialDiscount.textContent = systemDiscountTotal.toLocaleString();
        infoAddDiscount.textContent = extraDiscountTotal.toLocaleString();
        infoInstallFee.textContent = totalFees.toLocaleString();
        infoFinalPrice.textContent = finalPrice.toLocaleString();

        if (totalFees > 0) installFeeRow.style.display = 'block';
        else installFeeRow.style.display = 'none';

        contractTotal.textContent = finalPrice.toLocaleString();

        // --- Standardized Calculation Helper for Multi-Size Comparison ---
        function getComputedPrice(sizeIn, typeIn, spacesArray) {
            const sizeKeyIn = sizeIn.toString();
            const typeKeyIn = typeIn;
            const sizeCmIn = parseFloat(sizeKeyIn) / 10;
            const pricesIn = pricingMatrix[sizeKeyIn][typeKeyIn] || pricingMatrix[sizeKeyIn]['leather'] || pricingMatrix[sizeKeyIn]['standard'] || [0, 0];
            const [orig, prom] = pricesIn;

            let sTotalQty = 0;
            if (isPresetMode) {
                let scaleFactor = 1.0;
                if (sizeKeyIn === '800') scaleFactor = 0.56;
                else if (sizeKeyIn === '1000') scaleFactor = 0.36;
                else if (sizeKeyIn === '1200') scaleFactor = 0.25;
                sTotalQty = Math.ceil(activePresetQty600 * scaleFactor);
            } else {
                spacesArray.forEach(sp => {
                    const c = Math.ceil(sp.w / sizeCmIn);
                    const r = Math.ceil(sp.h / sizeCmIn);
                    sTotalQty += (c * r);
                });
            }

            const qtyWithSpare = sTotalQty;
            
            // Replicate promotion logic
            let uDisc = parseInt(groupPurchaseTier.value || 0) + 
                        parseInt(extraDiscountTier.value || 0) + 
                        (reviewCashChk && reviewCashChk.checked ? 1000 : 0);
            
            const refC = parseInt(referralCountIpt.value || 0);
            const refD = (parseInt(groupPurchaseTier.value) === 0) ? (refC * 50000) : 0;
            const eveD = (reviewEventChk && reviewEventChk.checked ? 30000 : 0);
            const flatD = refD + eveD;

            // Calculate 600mm-equivalent area for mathematically precise installation fee thresholds
            const qty600eq = qtyWithSpare * Math.pow(parseFloat(sizeKeyIn) / 600, 2);
            let iFee = 0;
            if (qty600eq < 40) iFee = 200000;
            else if (qty600eq < 70) iFee = 100000;
            
            // Re-installation demolition baseline (assuming flat rate per user request "up to 120 equivalency")
            const reinstallFee = (reinstallChk && reinstallChk.checked) ? 450000 : 0;
            
            const dFee = (regionDeliveryChk && regionDeliveryChk.checked ? 100000 : 0);
            const tFee = iFee + dFee + reinstallFee;

            const bT = qtyWithSpare * orig;
            const sD = qtyWithSpare * (orig - prom);
            const eD = (qtyWithSpare * uDisc) + flatD;
            const fP = Math.max(0, bT - sD - eD + tFee);
            return { total: fP, qty: qtyWithSpare, realQty: sTotalQty, unitOrig: orig, unitProm: prom, bT, sD, eD };
        }

        // --- Integrated Multi-Size Comparative Dashboard (Tabbed Logic) ---
        const comparisonSection = document.getElementById('comparisonSection');
        const analysisTabs = document.querySelectorAll('.analysis-tab');
        const activeReportGrid = document.getElementById('activeReportGrid');
        
        comparisonSection.style.display = 'block';
        
        // Compute Optimal Recommendation dynamically
        let optimalSize = matSizeSel.value;
        let optimalType = matTypeSel.value;
        let optimalLabel = `HASNOL 추천 사양 (${optimalSize} ${optimalType === 'leather' ? '레더' : '표준'})`;

        if (customerTendencySel) {
            if (customerTendencySel.value === 'budget') {
                optimalSize = '600';
                optimalType = 'standard';
                optimalLabel = 'HASNOL 가성비 추천 사양 (600 표준)';
            } else if (customerTendencySel.value === 'premium') {
                optimalSize = '1000';
                optimalType = 'leather';
                optimalLabel = 'HASNOL 프리미엄 추천 사양 (1000 레더)';
            }
        }

        // Define specifically requested model tiers
        const modelTiers = {
            'rec': { size: optimalSize, type: optimalType, label: optimalLabel },
            '600_std': { size: '600', type: 'standard', label: 'HASNOL 600 표준' },
            '800_std': { size: '800', type: 'standard', label: 'HASNOL 800 표준' },
            '800_lea': { size: '800', type: 'leather', label: 'HASNOL 800 레더' },
            '1000_lea': { size: '1000', type: 'leather', label: 'HASNOL 1000 레더' },
            '1200_lea': { size: '1200', type: 'leather', label: 'HASNOL 1200 레더' }
        };

        // Re-attach tab events (Pulse Sync)
        analysisTabs.forEach(tab => {
            tab.onclick = () => {
                analysisTabs.forEach(t => t.classList.remove('active'));
                analysisTabs.forEach(t => { t.style.background = 'white'; t.style.color = 'var(--text-main)'; t.style.fontWeight = '700'; });
                
                tab.classList.add('active');
                tab.style.background = 'var(--primary)';
                tab.style.color = 'white';
                tab.style.fontWeight = '800';
                calculateEstimate();
            };
        });

        const activeTab = document.querySelector('.analysis-tab.active');
        const currentTabId = activeTab ? activeTab.dataset.id : 'rec';

        const config = modelTiers[currentTabId];
        const calculated = getComputedPrice(config.size, config.type, spacesData);
        
        // 1. Prepare data for this specific selection's sketch
        const sSizeCm = parseFloat(config.size) / 10;
        const sSpacesData = spacesData.map(sp => ({
            ...sp,
            cols: Math.ceil(sp.w / sSizeCm),
            rows: Math.ceil(sp.h / sSizeCm)
        }));

        // 2. Render Simulation on the Left
        renderSketch(sSpacesData, sketchPad);

        // 3. Render the Specific Analysis Card on the Right
        activeReportGrid.innerHTML = `
            <div class="card animate-in" style="border: 2.5px solid var(--primary); padding: 35px; background: #fff; box-shadow: var(--shadow-premium); border-radius: 20px; position: relative;">
                <div style="position: absolute; top: -15px; left: 20px; background: var(--primary); color: white; padding: 4px 15px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em;">AI ESTIMATE : SELECT SPEC</div>
                
                <h3 style="font-size: 1.8rem; font-weight: 800; color: var(--text-main); margin-bottom: 25px; letter-spacing: -0.05em;">
                    ${config.label}
                </h3>

                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 15px;">
                    <span style="color: var(--text-muted); font-weight: 600;">시공 예상 수량</span>
                    <div style="text-align: right;">
                        <span style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">${calculated.qty.toLocaleString()}장</span>
                        <small style="display: block; font-size: 0.75rem; color: #8e8e93;">(시공 구조에 따라 오차 10장 내외 발생가능)</small>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;">
                    <span style="color: var(--text-muted); font-size: 0.95rem;">기초 권장가 (장당)</span>
                    <span style="color: #767676; text-decoration: line-through;">${calculated.unitOrig.toLocaleString()}원</span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 25px;">
                    <span style="color: var(--primary); font-size: 0.95rem; font-weight: 800;">특별 특가 (장당)</span>
                    <span style="font-size: 1.3rem; font-weight: 800; color: var(--text-main);">${calculated.unitProm.toLocaleString()}원</span>
                </div>

                <ul style="border-top: 1px solid #eef2ff; margin-top: 25px; padding-top: 20px; padding-left: 20px; font-size: 0.85rem; color: #444; line-height: 1.8; margin-bottom: 0;">
                    <li>기본 권장 및 설치 단가: ${calculated.bT.toLocaleString()}원</li>
                    <li>규격별 특별 프로모션 적용: -${calculated.sD.toLocaleString()}원</li>
                    <li>
                        공구/짝궁/후기/혜택 합계: -${calculated.eD.toLocaleString()}원
                        ${extraDiscountTier.value > 0 ? `<br><span style="color: var(--primary); font-size: 0.75rem; font-weight: 700; display: inline-block; margin-top: 4px;">(✔️ 적용 품목: ${extraDiscountTier.options[extraDiscountTier.selectedIndex].text})</span>` : ''}
                    </li>
                </ul>

                <div style="background: #f8faff; border-radius: 15px; padding: 25px; margin-top: 25px; border: 1px solid #eef2ff;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="font-weight: 700; color: var(--text-main);">최종 확정 견적</span>
                        <span style="font-size: 1.8rem; font-weight: 800; color: var(--primary); letter-spacing: -0.04em;">${calculated.total.toLocaleString()}원</span>
                    </div>
                    <p style="font-size: 0.75rem; color: var(--text-muted); text-align: right;">* 물류/시공 분담금 및 추가 혜택 일괄 적용 기준</p>
                </div>

                <button class="btn btn-primary" style="width: 100%; margin-top: 25px; padding: 18px; font-weight: 800; border-radius: 15px;" onclick="applyFromTab('${config.size}', '${config.type}')">
                    해당 규격으로 견적 및 계약서 적용
                </button>
            </div>
        `;

        // --- AI Comparison Summary Matrix (Financial Overview) ---
        (function renderComparisonTable(sData) {
            const tableContainer = document.getElementById('comparisonSummaryTable');
            if (!tableContainer) return;
            
            const tiers = [
                { id: '600_std', size: '600', type: 'standard', name: '600 표준' },
                { id: '800_std', size: '800', type: 'standard', name: '800 표준' },
                { id: '800_lea', size: '800', type: 'leather', name: '800 레더' },
                { id: '1000_lea', size: '1000', type: 'leather', name: '1000 레더' },
                { id: '1200_lea', size: '1200', type: 'leather', name: '1200 레더' }
            ];

            const activeTabItem = document.querySelector('.analysis-tab.active');
            const activeTabIdVal = activeTabItem ? activeTabItem.dataset.id : 'rec';

            let html = `
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>공간 적합 규격</th>
                            <th>예상 소요량</th>
                            <th>할인 특가 (장당)</th>
                            <th>최종 제안 총액</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            tiers.forEach(tier => {
                const data = getComputedPrice(tier.size, tier.type, sData);
                const isActive = (activeTabIdVal === tier.id);
                
                html += `
                    <tr class="summary-row ${isActive ? 'active' : ''}">
                        <td style="font-weight: 700;">${tier.name}</td>
                        <td>${data.qty}장</td>
                        <td>${data.unitProm.toLocaleString()}원</td>
                        <td class="financial-cell">${data.total.toLocaleString()}원</td>
                        <td>
                            ${isActive ? '<span style="color:var(--primary); font-size:0.7rem;">● 분석중</span>' : `<button class="preset-chip" style="font-size:0.65rem; padding:4px 8px;" onclick="document.querySelector('.analysis-tab[data-id=\\'${tier.id}\\']').click()">비전환</button>`}
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table>`;
            tableContainer.innerHTML = html;
        })(spacesData);

    }

    window.applyFromTab = function(size, type) {
        selectModel(size, type);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    function renderSketch(spacesData, targetContainer = null) {
        const container = targetContainer || sketchPad;
        container.innerHTML = ''; 

        // Add Nano-AI Scan line
        const scan = document.createElement('div');
        scan.className = 'scan-line';
        container.appendChild(scan);

        if (spacesData.length === 0) {
            container.innerHTML = '<p style="color:#aaa; font-weight:500;">가로, 세로 값을 입력하면<br>AI가 공간별로 분석하여 배치를 그려냅니다.</p>';
            return;
        }

        const planContainer = document.createElement('div');
        planContainer.style = 'display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; width: 100%; position: relative; z-index: 10;';

        spacesData.forEach(space => {
            const spaceWrapper = document.createElement('div');
            spaceWrapper.style = 'background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px; text-align: center; border: 1px solid #eef2ff;';
            spaceWrapper.className = 'ai-pulse';

            const grid = document.createElement('div');
            grid.style.display = 'grid';
            grid.style.gap = '2px';
            grid.style.margin = '0 auto';
            grid.style.gridTemplateColumns = `repeat(${space.cols}, 1fr)`;
            
            const maxWidth = targetContainer ? 160 : 320;
            const maxTileLimit = targetContainer ? 12 : 24;
            const tileSize = Math.max(3, Math.min(maxTileLimit, Math.floor(maxWidth / space.cols)));
            
            grid.style.width = 'fit-content';
            
            for (let i = 0; i < space.cols * space.rows; i++) {
                const tile = document.createElement('div');
                tile.style.width = `${tileSize}px`;
                tile.style.height = `${tileSize}px`;
                tile.style.background = 'var(--primary)';
                tile.style.opacity = (targetContainer ? '0.7' : '0.9');
                tile.style.borderRadius = '1px';
                grid.appendChild(tile);
            }
            
            spaceWrapper.appendChild(grid);
            const label = document.createElement('p');
            label.style = 'font-size: 0.75rem; margin-top: 10px; color: var(--primary); font-weight: 800; letter-spacing: -0.02em;';
            label.innerHTML = `<span style="font-size:0.6rem; vertical-align:middle; margin-right:4px; opacity:0.6;">[NANO-ANALYSIS]</span>${space.typeName} (${space.cols}✕${space.rows})`;
            spaceWrapper.appendChild(label);

            planContainer.appendChild(spaceWrapper);
        });
        container.appendChild(planContainer);
    }

    // --- Official Certification Data (Crawled from hasnol.kr) ---
    const certifications = [
        { title: 'SGS 충격흡수 98%', body: '글로벌 안전성 인증', icon: 'shield-check' },
        { title: 'KOTITI 라돈안심', body: '방사능 안전 테스트 완료', icon: 'wind' },
        { title: 'KTR 난연인증', body: 'UL 94 V-2 등급 획득', icon: 'flame' },
        { title: 'KC 어린이제품', body: '유해물질 불검출 인증', icon: 'baby' },
        { title: 'KSPO 공식인정', body: '충격흡수율 73.6% 인정', icon: 'award' },
        { title: '아토피 안심', body: '영유아 피부안전 통과', icon: 'heart' },
        { title: '반려동물 친환경', body: 'KACI 향균 및 안전 통과', icon: 'dog' },
        { title: 'ISO 9001:2015', body: '국제 품질 경영 표준', icon: 'globe' }
    ];

    // --- Dynamic Review Data (Crawled from Naver/Insta) ---
    const reviewData = [
        {
          title: "하늘매트 내돈내산 - 확실한 시각적 개방감",
          desc: "책장 틈새까지 정교하게 시공되어 인테리어 드라마틱함",
          url: "https://cafe.naver.com/imsanbu/74757624",
          tag: "BEST", icon: "🏠", size: "800", type: "leather"
        },
        {
          title: "아기 배밀이 필수템, 만족도 100%",
          desc: "집이 밝아 보이고 층간소음 걱정이 사라졌어요",
          url: "https://cafe.naver.com/smartkim82/3443",
          tag: "BABY", icon: "👶", size: "600", type: "standard"
        },
        {
          title: "2시간 만에 끝난 거실 복도 시공 후기",
          desc: "베이지 컬러의 화사함과 촉감이 강점인 하늘매트",
          url: "https://cafe.naver.com/overseer/1299417",
          tag: "FAST", icon: "🛋️", size: "800", type: "leather"
        },
        {
          title: "다양한 매트 비교 끝에 선택한 결과",
          desc: "합리적인 가격과 전문적인 시공 품질에 대만족",
          url: "https://cafe.naver.com/smartkim82/3460",
          tag: "REVIEW", icon: "🌟", size: "1000", type: "leather"
        },
        {
          title: "셀프 시공에도 가성비 최고인 하늘매트",
          desc: "전문가 도움 없이도 인테리어 효과가 뛰어남",
          url: "https://cafe.naver.com/imsanbu/77909136",
          tag: "DIY", icon: "🛠️", size: "1200", type: "leather"
        }
    ];

    function renderCertifications() {
        const vault = document.getElementById('certVault');
        if (!vault) return;
        vault.innerHTML = certifications.map(cert => `
            <div style="padding: 15px; background: white; border-radius: 12px; border: 1px solid #eef2ff; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
                <i data-lucide="${cert.icon}" style="width: 20px; color: var(--primary); margin-bottom: 8px;"></i>
                <h5 style="font-size: 0.8rem; font-weight: 800; margin-bottom: 4px; color: var(--text-main);">${cert.title}</h5>
                <p style="font-size: 0.65rem; color: #888;">${cert.body}</p>
            </div>
        `).join('');
        lucide.createIcons();
    }

    function updateDynamicReviews(selectedSize, selectedType) {
        const container = document.getElementById('dynamicReviews');
        if (!container) return;
        
        // Filter reviews that match size OR type, or default to Best
        const filtered = reviewData.filter(r => r.size === selectedSize || r.type === selectedType);
        const displayList = filtered.length > 0 ? filtered : reviewData.slice(0, 3);

        container.innerHTML = displayList.map(rev => `
            <a href="${rev.url}" class="review-link" target="_blank">
              <span style="font-size: 1.2rem; margin-right: 15px;">${rev.icon}</span>
              <div>
                <span class="review-meta">${rev.size}mm ${rev.type.toUpperCase()} | ${rev.tag}</span>
                <strong style="font-size: 0.95rem;">${rev.title}</strong>
                <p style="font-size: 0.8rem; color: var(--text-muted);">${rev.desc}</p>
              </div>
            </a>
        `).join('');
    }

    // Initial renders
    renderCertifications();
    calculateEstimate(); // Calls updateDynamicReviews inside
    
    // Final Trigger Integration
    const originalCalc = calculateEstimate;
    calculateEstimate = function() {
        originalCalc();
        updateDynamicReviews(matSizeSel.value, matTypeSel.value);
    };

    // --- Digital Signature & PDF Sharing Logic ---
    const sigCanvas = document.getElementById('signaturePad');
    if (sigCanvas) {
        const ctx = sigCanvas.getContext('2d');
        let isDrawing = false;
        
        const getCrossPos = (e) => {
            const rect = sigCanvas.getBoundingClientRect();
            const scaleX = sigCanvas.width / rect.width;
            const scaleY = sigCanvas.height / rect.height;
            if (e.touches && e.touches.length > 0) {
                return {
                    x: (e.touches[0].clientX - rect.left) * scaleX,
                    y: (e.touches[0].clientY - rect.top) * scaleY
                };
            }
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };

        const startDraw = (e) => {
            isDrawing = true;
            document.getElementById('signPlaceholder').style.display = 'none';
            ctx.beginPath();
            const pos = getCrossPos(e);
            ctx.moveTo(pos.x, pos.y);
            if(e.cancelable) e.preventDefault();
        };

        const drawStroke = (e) => {
            if (!isDrawing) return;
            const pos = getCrossPos(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#0f172a';
            ctx.stroke();
            if(e.cancelable) e.preventDefault();
        };

        const stopDraw = () => {
            isDrawing = false;
            ctx.closePath();
        };

        sigCanvas.addEventListener('mousedown', startDraw);
        sigCanvas.addEventListener('mousemove', drawStroke);
        sigCanvas.addEventListener('mouseup', stopDraw);
        sigCanvas.addEventListener('mouseout', stopDraw);
        
        sigCanvas.addEventListener('touchstart', startDraw, {passive: false});
        sigCanvas.addEventListener('touchmove', drawStroke, {passive: false});
        sigCanvas.addEventListener('touchend', stopDraw);

        document.getElementById('clearSignBtn').addEventListener('click', () => {
            ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
            document.getElementById('signPlaceholder').style.display = 'block';
        });
    }

    const sharePdfBtn = document.getElementById('sharePdfBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    
    // Core PDF Generation Pipeline
    const generateAndProcessPDF = async (actionType) => {
        if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            alert('PDF 렌더링 모듈을 불러오는 중입니다. 잠시 후 1~2초 뒤에 다시 시도해 주세요.');
            return;
        }

        const btnToUpdate = actionType === 'share' ? sharePdfBtn : downloadPdfBtn;
        const originalText = btnToUpdate.innerHTML;
        btnToUpdate.innerHTML = '<span style="font-size: 1.1rem; margin-right: 5px;">⏳</span> PDF 문서 구성 중...';
        btnToUpdate.disabled = true;

        setTimeout(async () => {
            try {
                // Focus styling for clean PDF export
                const elementToCapture = document.querySelector('.container') || document.body;
                
                const noPrintElements = document.querySelectorAll('.no-print');
                noPrintElements.forEach(el => el.style.display = 'none');
                
                if (sigCanvas) {
                    sigCanvas.style.border = 'none';
                    sigCanvas.style.background = 'transparent';
                }

                const canvasMap = await html2canvas(elementToCapture, {
                    scale: 1.5,  // Optimized for faster speed and memory
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    allowTaint: true, // Help bypass file:// protocol security restrictions
                    logging: false
                });

                // Restore styling
                noPrintElements.forEach(el => el.style.display = '');
                if (sigCanvas) {
                    sigCanvas.style.border = '1.5px dashed #ccc';
                    sigCanvas.style.background = '#fafafa';
                }

                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                const imgData = canvasMap.toDataURL('image/jpeg', 0.95);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvasMap.height * pdfWidth) / canvasMap.width;
                
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                const fileNameDate = new Date().toISOString().slice(0,10);
                const customFileName = `HASNOL_전자계약__${fileNameDate}.pdf`;

                if (navigator.share && navigator.canShare) {
                    const blob = pdf.output('blob');
                    const file = new File([blob], customFileName, { type: 'application/pdf' });
                    
                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: 'HASNOL 프리미엄 바닥매트 전자계약서',
                            text: '전자서명이 완료된 하스놀 시공 계약서 및 견적서입니다.'
                        });
                    } else {
                        pdf.save(customFileName);
                        alert(`📄 기기에 저장되었습니다: ${customFileName}`);
                    }
                } else {
                    // Desktop / Force Download Mode
                    pdf.save(customFileName);
                    alert(`✅ [전자계약보관 완료]\n${customFileName} 파일이 기기에 다운로드되었습니다.\n(참고: 현재 접근하신 PC 환경에서는 웹 공유 API가 제한되어 원터치 다운로드 처리되었습니다)`);
                }
            } catch (error) {
                console.error("PDF Generate Error", error);
                alert("전자문서 변환 중 보안 권한 문제(CORS)가 발생했습니다. 브라우저 대신 직접 '문서 PDF 저장/출력' 버튼을 눌러주세요. 오류 내용: " + error.message);
            } finally {
                btnToUpdate.innerHTML = originalText;
                btnToUpdate.disabled = false;
            }
        }, 150);
    };

    if (sharePdfBtn) sharePdfBtn.addEventListener('click', () => generateAndProcessPDF('share'));
    if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', () => window.print());
});

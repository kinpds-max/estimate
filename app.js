// Hasnol Estimate App Logic

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const customerNameIpt = document.getElementById('customerName');
    const matSizeSel = document.getElementById('matSize');
    const widthIpt = document.getElementById('width');
    const heightIpt = document.getElementById('height');
    const pricePerMatIpt = document.getElementById('pricePerMat');
    const discountPerMatIpt = document.getElementById('discountPerMat');
    const groupPurchaseChk = document.getElementById('groupPurchase');
    const reviewEventChk = document.getElementById('reviewEvent');
    const calculateBtn = document.getElementById('calculateBtn');

    const resQty = document.getElementById('resQty');
    const resTotal = document.getElementById('resTotal');
    const sketchPad = document.getElementById('sketchPad');

    const infoBasePrice = document.getElementById('infoBasePrice');
    const infoBeforeDiscount = document.getElementById('infoBeforeDiscount');
    const infoDiscountAmount = document.getElementById('infoDiscountAmount');
    const infoFinalPrice = document.getElementById('infoFinalPrice');

    const contractBuyer = document.getElementById('contractBuyer');
    const contractTotal = document.getElementById('contractTotal');

    // Initial State
    updateContract();

    // Event Listeners
    calculateBtn.addEventListener('click', calculateEstimate);
    customerNameIpt.addEventListener('input', updateContract);
    matSizeSel.addEventListener('change', () => {
        // Auto-set default price based on size
        if (matSizeSel.value === '500') {
            pricePerMatIpt.value = 11000;
        } else {
            pricePerMatIpt.value = 21800;
        }
    });

    function updateContract() {
        const name = customerNameIpt.value || '__________';
        contractBuyer.textContent = name;
    }

    function calculateEstimate() {
        const width = parseFloat(widthIpt.value);
        const height = parseFloat(heightIpt.value);
        // Convert mm to cm for calculation if needed, but let's keep it consistent
        const matSizeCm = parseFloat(matSizeSel.value) / 10; 
        
        const pricePerUnit = parseInt(pricePerMatIpt.value) || 0;
        const discPerUnit = parseInt(discountPerMatIpt.value) || 0;
        
        const isGroup = groupPurchaseChk.checked;
        const isReview = reviewEventChk.checked;

        if (!width || !height || width <= 0 || height <= 0) {
            alert('가로, 세로 길이를 cm 단위로 정확히 입력해주세요.');
            return;
        }

        // Logic 1: Matrix calculation (Quantity)
        const cols = Math.ceil(width / matSizeCm);
        const rows = Math.ceil(height / matSizeCm);
        const totalQty = cols * rows;

        // Logic 2: Pricing
        const baseSubtotal = totalQty * pricePerUnit;
        
        // Total discount calculation
        let totalDiscount = totalQty * discPerUnit;
        if (isGroup) totalDiscount += (totalQty * 1000);
        if (isReview) totalDiscount += 50000;

        const finalPrice = Math.max(0, baseSubtotal - totalDiscount);

        // Update UI Results
        resQty.innerHTML = `${totalQty.toLocaleString()}<small style="font-size: 1rem; font-weight: 300;"> 장</small>`;
        resTotal.innerHTML = `${finalPrice.toLocaleString()}<small style="font-size: 1rem; font-weight: 300;"> 원</small>`;

        // Update Info Section
        infoBasePrice.textContent = pricePerUnit.toLocaleString();
        infoBeforeDiscount.textContent = baseSubtotal.toLocaleString();
        infoDiscountAmount.textContent = totalDiscount.toLocaleString();
        infoFinalPrice.textContent = finalPrice.toLocaleString();

        // Update Contract
        contractTotal.textContent = finalPrice.toLocaleString();

        // Logic 3: Visual Sketch
        renderSketch(cols, rows);
    }

    function renderSketch(cols, rows) {
        sketchPad.innerHTML = '';
        
        const grid = document.createElement('div');
        grid.className = 'sketch-grid';
        
        // Calculate dynamic columns based on ratio
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        
        // Maximum width for the sketch to fit nicely
        const maxDisplayWidth = 350;
        const maxDisplayHeight = 350;
        
        // Calculate cell size based on ratio
        let cellW, cellH;
        if (cols >= rows) {
            cellW = maxDisplayWidth / cols;
            cellH = cellW; // Keep it square
        } else {
            cellH = maxDisplayHeight / rows;
            cellW = cellH;
        }

        grid.style.width = `${cols * cellW}px`;
        grid.style.height = `${rows * cellH}px`;

        const totalTiles = cols * rows;
        for (let i = 0; i < totalTiles; i++) {
            const tile = document.createElement('div');
            tile.className = 'sketch-tile';
            tile.style.width = `${cellW}px`;
            tile.style.height = `${cellH}px`;
            tile.style.border = '1px solid #e0e0e0';
            
            // Just for premium feel, staggered animation
            tile.style.animation = `fadeIn 0.2s ease forwards ${i * 0.005}s`;
            tile.style.opacity = '0';
            
            grid.appendChild(tile);
        }

        sketchPad.appendChild(grid);
    }
});

/**
 * 檢驗報告頁面的滑動功能
 * 檔案名稱: report-slider.js
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有滑塊
    const sliders = ['nutrition', 'heavy-metals', 'microorganism', 'aflatoxin'];
    
    sliders.forEach(function(sliderId) {
        initSlider(sliderId);
    });
    
    // 切換報告標籤
    const reportTabs = document.querySelectorAll('.report-tab');
    reportTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            // 移除所有標籤的active狀態
            reportTabs.forEach(t => t.classList.remove('active'));
            // 新增當前標籤的active狀態
            this.classList.add('active');
            
            // 隱藏所有報告部分
            const allReports = document.querySelectorAll('.report-section');
            allReports.forEach(r => r.style.display = 'none');
            
            // 顯示目標報告部分
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).style.display = 'block';
            
            // 重設滑塊位置
            resetSlider(targetId);
        });
    });
    
    // 點擊頁碼指示器切換頁面
    sliders.forEach(function(sliderId) {
        const dots = document.querySelectorAll(`#${sliderId}-pagination .slider-dot`);
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                goToSlide(sliderId, index);
            });
        });
    });
    
    // 支持觸控滑動
    sliders.forEach(function(sliderId) {
        const sliderEl = document.getElementById(`${sliderId}-slider`);
        
        let startX;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let isDragging = false;
        let currentSlide = 0;
        const slideCount = sliderEl.children.length;
        
        sliderEl.addEventListener('touchstart', touchStart);
        sliderEl.addEventListener('touchmove', touchMove);
        sliderEl.addEventListener('touchend', touchEnd);
        
        // 桌面端滑鼠拖曳支持
        sliderEl.addEventListener('mousedown', mouseStart);
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', mouseEnd);
        
        function touchStart(event) {
            startX = event.touches[0].clientX;
            isDragging = true;
        }
        
        function mouseStart(event) {
            startX = event.clientX;
            isDragging = true;
            // 防止拖曳時選取文字
            event.preventDefault();
        }
        
        function touchMove(event) {
            if (isDragging) {
                const currentX = event.touches[0].clientX;
                const diff = currentX - startX;
                
                // 計算新的translate值（加上之前的位置）
                currentTranslate = prevTranslate + diff;
                
                // 限制邊界
                if (currentTranslate > 0) {
                    currentTranslate = 0;
                } else if (currentTranslate < -(slideCount - 1) * sliderEl.clientWidth) {
                    currentTranslate = -(slideCount - 1) * sliderEl.clientWidth;
                }
                
                sliderEl.style.transform = `translateX(${currentTranslate}px)`;
            }
        }
        
        function mouseMove(event) {
            if (isDragging) {
                const currentX = event.clientX;
                const diff = currentX - startX;
                
                // 計算新的translate值（加上之前的位置）
                currentTranslate = prevTranslate + diff;
                
                // 限制邊界
                if (currentTranslate > 0) {
                    currentTranslate = 0;
                } else if (currentTranslate < -(slideCount - 1) * sliderEl.clientWidth) {
                    currentTranslate = -(slideCount - 1) * sliderEl.clientWidth;
                }
                
                sliderEl.style.transform = `translateX(${currentTranslate}px)`;
            }
        }
        
        function touchEnd() {
            handleDragEnd();
        }
        
        function mouseEnd() {
            handleDragEnd();
        }
        
        function handleDragEnd() {
            if (isDragging) {
                isDragging = false;
                
                // 根據滑動距離決定顯示哪一頁
                const threshold = sliderEl.clientWidth * 0.2; // 滑動超過20%寬度判定為翻頁
                const movedBy = currentTranslate - prevTranslate;
                
                if (movedBy < -threshold && currentSlide < slideCount - 1) {
                    currentSlide++;
                } else if (movedBy > threshold && currentSlide > 0) {
                    currentSlide--;
                }
                
                goToSlide(sliderId, currentSlide);
                prevTranslate = -currentSlide * sliderEl.clientWidth;
                currentTranslate = prevTranslate;
            }
        }
    });
});

/**
 * 初始化滑塊控制
 * @param {string} sliderId - 滑塊的ID前綴
 */
function initSlider(sliderId) {
    const slider = document.getElementById(`${sliderId}-slider`);
    const prevBtn = document.querySelector(`.prev-btn[data-slider="${sliderId}"]`);
    const nextBtn = document.querySelector(`.next-btn[data-slider="${sliderId}"]`);
    const slideCount = slider.children.length;
    let currentSlide = 0;
    
    // 設定初始頁碼指示器
    updatePageIndicator(sliderId, currentSlide, slideCount);
    
    // 上一頁按鈕事件
    prevBtn.addEventListener('click', function() {
        if (currentSlide > 0) {
            currentSlide--;
            goToSlide(sliderId, currentSlide);
        }
    });
    
    // 下一頁按鈕事件
    nextBtn.addEventListener('click', function() {
        if (currentSlide < slideCount - 1) {
            currentSlide++;
            goToSlide(sliderId, currentSlide);
        }
    });
}

/**
 * 切換到指定的幻燈片
 * @param {string} sliderId - 滑塊的ID前綴
 * @param {number} index - 目標幻燈片索引
 */
function goToSlide(sliderId, index) {
    const slider = document.getElementById(`${sliderId}-slider`);
    const prevBtn = document.querySelector(`.prev-btn[data-slider="${sliderId}"]`);
    const nextBtn = document.querySelector(`.next-btn[data-slider="${sliderId}"]`);
    const dots = document.querySelectorAll(`#${sliderId}-pagination .slider-dot`);
    const slideCount = slider.children.length;
    
    // 移動滑塊
    slider.style.transform = `translateX(-${index * 100}%)`;
    
    // 更新按鈕狀態
    prevBtn.classList.toggle('disabled', index === 0);
    nextBtn.classList.toggle('disabled', index === slideCount - 1);
    
    // 更新頁碼指示器
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    // 更新頁碼文字
    updatePageIndicator(sliderId, index, slideCount);
}

/**
 * 更新頁碼指示器文字
 * @param {string} sliderId - 滑塊的ID前綴
 * @param {number} currentIndex - 當前幻燈片索引
 * @param {number} totalSlides - 幻燈片總數
 */
function updatePageIndicator(sliderId, currentIndex, totalSlides) {
    const indicator = document.getElementById(`${sliderId}-indicator`);
    indicator.textContent = `${currentIndex + 1} / ${totalSlides}`;
}

/**
 * 重設滑塊位置到第一頁
 * @param {string} sliderId - 滑塊的ID前綴
 */
function resetSlider(sliderId) {
    goToSlide(sliderId, 0);
}
const puppeteer = require('puppeteer');

let currentDate = ""; // 初始化空字串

function getCurrentDate() {
    const now = new Date();
    let currentDate =`${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    return currentDate;
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,  // 關鍵參數：禁用預設視口限制
        args: [
            '--start-maximized',  // 強制瀏覽器最大化
            '--disable-infobars', // 移除提示欄位
            '--no-sandbox'        // 提升穩定性
        ]
    });

    const page = await browser.newPage();
    
    // 動態獲取可用視窗區域 ▼▼▼▼▼▼▼▼▼▼▼▼
    const { width, height } = await page.evaluate(() => ({
        width: window.screen.availWidth,
        height: window.screen.availHeight
    }));
    
    // 在控制台顯示偵測結果
    //console.log(`自適應分辨率: ${width}x${height}`);
    
    while (true) {
        try {
            await navigateToPage("https://www.mvdis.gov.tw/m3-emv-trn/exm/locations#gsc.tab=0");
            // 等待 1.5 秒
            await new Promise(resolve => setTimeout(resolve, 600));
            // 清除 #expectExamDateStr 的內容
            await page.click("#expectExamDateStr", { clickCount: 3 });
            await page.keyboard.press('Backspace');
            // 等待 0.8 秒
            //  await new Promise(resolve => setTimeout(resolve, 800));
            
            // 選擇 #licenseTypeCode 的第三個選項
            await page.select("#licenseTypeCode", await page.evaluate(() => document.querySelector("#licenseTypeCode > option:nth-child(2)").value));
            // 等待 0.8 秒
            //  await new Promise(resolve => setTimeout(resolve, 800));
            
            // 輸入考試日期
            await page.type("#expectExamDateStr", "1140319");
            // 等待 0.8 秒
            //  await new Promise(resolve => setTimeout(resolve, 800));
            // 7. 選擇 #dmvNoLv1 的第三個選項 臺北區監理所（北宜花）
            await page.select("#dmvNoLv1", await page.evaluate(() => document.querySelector("#dmvNoLv1 > option:nth-child(3)").value));

            // 7-1測試 選擇 #dmvNoLv1 的第二個選項 臺北市區監理所（含金門馬祖）
            //await page.select("#dmvNoLv1", await page.evaluate(() => document.querySelector("#dmvNoLv1 > option:nth-child(2)").value));

            // 8. 等待 0.8 秒
            await new Promise(resolve => setTimeout(resolve, 800));

            // 9. 選擇 #dmvNo 的第三個選項 板橋監理站(新北市中和區中山路三段116號)
            await page.select("#dmvNo", await page.evaluate(() => document.querySelector("#dmvNo > option:nth-child(3)").value));
            
            //9-1.#測試 選擇 #dmvNo 的第四個選項 連江監理站(連江監理站(連江縣南竿鄉津沙村155號))
            //await page.select("#dmvNo", await page.evaluate(() => document.querySelector("#dmvNo > option:nth-child(5)").value));
            //await new Promise(resolve => setTimeout(resolve, 1000));
            // 點擊提交按鈕
            await page.click("#form1 > div > a");
            // 呼叫 getCurrentDate
            currentDate = getCurrentDate(); // 多次调用
            console.log(`${currentDate} 已點擊| SignUp 按鈕`);
            // 等待 0.8 秒
            await new Promise(resolve => setTimeout(resolve, 800));
            // 點擊確認按鈕（若有彈出視窗）
            await page.click("body > div.blockUI.blockMsg.blockPage > div > center > a:nth-child(3)").catch(() => {});
            // 等待 10 秒
            await new Promise(resolve => setTimeout(resolve, 1000));
            // 檢查每個 tr 中的 "額滿"
            const rows = await page.$$('#trnTable > tbody > tr');
            let availableSlotFound = false;
                
            for (let i = 1; i < rows.length +1 ; i++) {
                // 动态获取当前行元素
                const currentRow = await page.$(`#trnTable > tbody > tr:nth-child(${i})`);
                
                // 獲取指定元素的文本內容
                let dateText = '';
                dateText = await page.$eval(`#trnTable > tbody > tr:nth-child(${i}) > td:nth-child(1)`, el => el.innerText);
                
                // 輸出獲取的文本
                const slotText = await page.evaluate(row => row.querySelector("td:nth-child(3)")?.innerText || "", currentRow);
                
                if (!slotText.includes("額滿") ) {

                    currentDate = getCurrentDate(); // 獲取當前日期
                    console.log(`${currentDate} 第 ${i} 行 名額未滿，點擊報名按鈕！`);
                    // console.log(`${i}`);
                    await page.click(`#trnTable > tbody > tr:nth-child(${i}) > td:nth-child(4) > a`);
                    await new Promise(resolve => setTimeout(resolve, 500));

                    await page.click(`body > div.blockUI.blockMsg.blockPage > div.align_c > a`);
            
                    // 填寫報名資料
                    await page.type("#idNo",        "");   // 身分證字號
                    await page.type("#birthdayStr", "");   // 生日
                    await page.type("#name",        "");   // 姓名
                    await page.type("#contactTel",  "");   // 聯絡電話
                    await page.type("#email",       "");   // 電子郵件
                    // 點擊報名按鈕
                    await page.evaluate(() => {
                        document.querySelector('#form1 > table > tbody > tr:nth-child(6) > td > a.std_btn').click();
                    });


                    currentDate = getCurrentDate(); // 獲取當前日期
                    console.log(`${currentDate} 基本資料輸入完成! `);

                    await new Promise(resolve => setTimeout(resolve, 15000));


                    currentDate = getCurrentDate(); // 獲取當前日期
                    console.log(`${currentDate} 已點擊| 報名 SignUp 按鈕`);

                    console.log(`已報名,第 ${i} 行的日期是: ${dateText}`);
                    // 輸出報名信息和當前時間
                    currentDate = getCurrentDate(); // 獲取當前日期                         
                    console.log(`${currentDate} 已報名成功|日期是: ${dateText} `);
                    availableSlotFound = true;

                    // 增加計數器以避免無限迴圈
                    i++;
                    }
                    else {
                        //console.log(`第 ${i } 行 名額已滿，跳過...`);
                        i++
                        continue;
                    }
                // 8. 等待 0.8 秒
                await new Promise(resolve => setTimeout(resolve, 800));
            
                if (!availableSlotFound) {
                    console.log("所有選項均額滿，重新檢查...");
                    await page.reload();
                    await page.waitForSelector('#trnTable > tbody > tr', { timeout: 5000 }); // 等待表格加载
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
        }
        } catch (error) {
            //console.error(`錯誤: ${error.message}`);
            await page.reload();
            continue;
        }

    }

    async function navigateToPage(url) {
        let attempts = 0;
        while (attempts < 3) {
            try {
                await page.goto(url, { waitUntil: 'networkidle2' });
                return;
            } catch (error) {
                console.error(`導航失敗: ${error.message}`);
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        throw new Error('多次導航失敗');
    }
})();
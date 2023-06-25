FastClick.attach(document.body);
(async function () {
    const appBox = document.querySelector("#app"),
        topBox = appBox.querySelector(".top"),
        imgTotalBox = topBox.querySelector(".top-big"),
        pauseBox = topBox.querySelector('.top-small'),
        lyricBox = appBox.querySelector(".middle"),
        lyricHeader = lyricBox.querySelector('.middle-head'),
        lyricBody = lyricBox.querySelector('.middle-body'),
        progressBox = appBox.querySelector(".bottom"),
        timeBox = progressBox.querySelector('.progress-back'),
        progressBack = timeBox.querySelector('.progress-total'),
        currentBack = progressBack.querySelector('.already'),
        currentBox = timeBox.querySelector('.current'),
        durationBox = timeBox.querySelector('.duration'),
        audioBox = document.querySelector('#audioBox')
    console.log(currentBox);
    let wordList
    let matchNum = 0
    let timer = null


    //处理歌词跟随
    const handle = function handle() {
        let pH = wordList[0].offsetHeight
        let { currentTime, duration } = audioBox
        //防止audio文件有问题
        if (isNaN(currentTime) || isNaN(duration)) return;
        //如果audio实际播放时间大于总时间直接退出
        if (currentTime >= duration) {
            playend();
            return;
        }
        //格式化当前播放的时间
        let {
            minutes: currentTimeMinutes,
            seconds: currentTimeSeconds
        } = format(currentTime),
            {
                minutes: durationMinutes,
                seconds: durationSeconds
            } = format(duration),
            ratio = Math.round(currentTime / duration * 100)

        console.log(currentTimeMinutes, currentTimeSeconds);
        currentBox.innerHTML = `${currentTimeMinutes}:${currentTimeSeconds}`;
        durationBox.innerHTML = `${durationMinutes}:${durationSeconds}`
        currentBack.style.width = `${ratio}%`

        //匹配的p数量
        let matchs = wordList.filter(match => {
            let minutes = match.getAttribute('minutes'),
                seconds = match.getAttribute('seconds')
            return minutes === currentTimeMinutes && seconds === currentTimeSeconds
        })
        //如果有匹配的就让匹配的字体变色
        if (matchs.length > 0) {
            wordList.forEach(item => item.className = '')
            matchs.forEach(item => item.className = 'active')
            matchNum += matchs.length
            if (matchNum > 2) {
                let offset = (matchNum - 2) * pH
                lyricBody.style.transform = `translateY(${-offset}px)`
                
            }
        }
    }



    //给头部盒子绑定点击事件
    topBox.addEventListener("click", function () {
        if (audioBox.paused) {
            audioBox.play();
            imgTotalBox.style.animationPlayState = "running";
            pauseBox.style.opacity = "0";
            handle();
            if (!timer) timer = setInterval(handle, 1000);
            return;
        }
        audioBox.pause();
        imgTotalBox.style.animationPlayState = "paused";
        pauseBox.style.opacity = "1";
        clearInterval(timer);
        timer = null;
    });





    //格式化时间以及补0操作
    const format = function format(time) {
        let minutes = Math.floor(time / 60),
            seconds = Math.round(time - minutes * 60)
        minutes = minutes > 9 ? minutes + '' : "0" + minutes
        seconds = seconds > 9 ? seconds + '' : "0" + seconds
        return {
            minutes,
            seconds
        }
    }
    const bindLyric = function bindLyric(lyric) {
        let arr = [];
        let index = 1;
        lyric.replace(/\[(\d+):(\d+).(\d+)\](.+)\n/g, (_, $1, $2, $3, $4) => {
            arr.push({
                index: index++,
                minutes: $1,
                seconds: $2,
                percent: $3,
                text: $4.trim()
            });
        });
        console.log("歌词数组:", arr);
        let str = ''
        arr.forEach(({
            minutes,
            seconds,
            percent,
            index,
            text
        }) => {
            str += `
        <p minutes="${minutes}" seconds="${seconds}" percent="${percent}" index="${index}">
          ${text}
        </p>`;
        })
        lyricBody.innerHTML = str
        wordList = Array.from(lyricBody.querySelectorAll('p'))
        console.log(wordList);
    }
    //拿到数据初始化数据
    const binding = function binding(data) {
        let {
            title,
            author,
            duration,
            pic,
            audio,
            lyric
        } = data;
        let newImg = document.createElement('img')
        newImg.setAttribute('src', pic)
        imgTotalBox.appendChild(newImg)
        lyricHeader.innerHTML += `
        <span class="title">${title}</span>
        <span> - </span>
        <span class="singer">${author}</span>
      `;
        durationBox.innerHTML = duration;
        audioBox.src = audio;
        console.log(audio);
        bindLyric(lyric);
    }
    //利用axios封装请求方法，处理拿回来的数据
    try {
        let res = await API.queryLyric()
        console.log(res);
        let { code, data } = res
        if (+code === 200) {
            //初始化数据
            binding(data)
        }
    } catch (error) {
        console.log(error);
    }
})()














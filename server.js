const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json({ limit: '20mb' }));  // set a limit for large base64 images
// app.use(express.json({ limit: '10mb' }));  // set a limit for large base64 images
app.use('/masks', express.static(path.join(__dirname, './masks')));
app.use('/resultImages', express.static(path.join(__dirname, './resultImages')));

app.post('/saveCanvasImage', (req, res) => {
    // console.log(req.body);  // add this line

    const base64Data = req.body.imageData.replace(/^data:image\/png;base64,/, "");
    
    fs.writeFile('./masks/canvasImage.png', base64Data, 'base64', (err) => {
        if (err) {
            console.error(err);
            res.json({ message: 'Failed to save image' });
        } else {
            res.json({ message: 'Image saved successfully' });
        }
    });
});

app.post('/generateImagebySD', async (req, res) => {
    const { payload, imageID, modifyNum } = req.body;
    console.log("in generateImagebySD imageID", imageID)
    console.log("in generateImagebySD modifyNum", modifyNum)
    console.log("in generateImagebySD payload", payload)

    // const payloadTest = {
    //     "prompt": "1girl, upper body, looking at viewer, overcoat, ..., (photorealistic:1.4), best quality, masterpiece",
    //     "negative_prompt":"",
    //     "steps": 20,
    //     "sampler_name": "DPM++ SDE Karras",
    //     "width": 480,
    //     "height": 640,
    //     "restore_faces": true
    // }

    try {
        const response = await fetch('http://xxx.xxx.xxx.xxx:xxxx/sdapi/v1/img2img', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
 
        const data = await response.json();

        console.log("===>result data:", data)

        // 计算图片名称
        const imageNum = imageID + modifyNum;
        const imageName = `image${imageID}-${modifyNum}.png`;

        // 直接保存图片数据
        const base64Data = data.images[0].replace(/^data:image\/png;base64,/, "");
        fs.writeFile(`./resultImages/${imageName}`, base64Data, 'base64', (err) => {
            if (err) {
                console.error(err);
                res.json({ message: 'Failed to save image' });
            } else {
                res.json({ message: 'Image saved successfully' });
            }
        });

    } catch (error) {
        console.error('API调用错误:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.listen(6002, () => {
    console.log('Server running on http://localhost:6002');
});
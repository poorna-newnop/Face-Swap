import { useState, useRef, CSSProperties, useEffect } from 'react';
import ReactPlayer from 'react-player';
import Webcam from 'react-webcam';
import BeatLoader from 'react-spinners/BeatLoader';
import CloseIcon from './assets/close.png';
import CameraIcon from './assets/camera.svg';

const LandingPage = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [videoURL, setVideoURL] = useState<string>(
    'https://face-swap-s3.s3.ap-northeast-2.amazonaws.com/Newnop+Landsubsidence+Promo+Updated+Final+.mp4'
  );
  const [videoFinished, setVideoFinished] = useState<boolean>(false);
  const [showPlayer, setShowPlayer] = useState<boolean>(true);
  const [showWebCam, setShowWebCam] = useState<boolean>(false);
  const [opacity, setOpacity] = useState<number>(1);
  const webcamRef = useRef<Webcam>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const MainVideURl = 'https://face-swap-s3.s3.ap-northeast-2.amazonaws.com/Newnop+Landsubsidence+Promo+Updated+Final+.mp4';
  const AIVideoOriginal = 'https://face-swap-s3.s3.ap-northeast-2.amazonaws.com/Test+Crop.mp4';

  const captureImage = () => {
    setShowWebCam(false);
    const image = webcamRef.current?.getScreenshot();
    if (image) {
      setImageSrc(image);
    }
  };

  const videoConstraints = {
    facingMode: 'user',
  };

  const handleVideoEnd = () => {
    setOpacity(0);
    setTimeout(() => {
      setShowPlayer(false);
      setVideoURL(MainVideURl);
    }, 1000);

    setVideoFinished(true);
  };

  const apiKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQ1NjQ4MDEsInByb2R1Y3RfY29kZSI6IjA2NzAwMyIsInRpbWUiOjE3MzEzOTc1OTV9.pznE3kHn2KpQUgYT37LwR4hInBa9WHAFxHjN43106Bw';

  const [jobId, setJobId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createJob = async () => {
    setLoading(true);
    setError('');

    const url = 'https://developer.remaker.ai/api/remaker/v1/face-swap-video/create-job';
    const formData = new FormData();
    formData.append('target_video_url', 'https://face-swap-s3.s3.ap-northeast-2.amazonaws.com/Test+Crop.mp4');

    try {
      const imageSrcToUse =
        imageSrc ||
        'https://static.vecteezy.com/system/resources/thumbnails/036/442/721/small_2x/ai-generated-portrait-of-a-young-man-no-facial-expression-facing-the-camera-isolated-white-background-ai-generative-photo.jpg';

      const response = await fetch(imageSrcToUse);
      const imageBlob = await response.blob();

      console.log('image', imageBlob);

      formData.append('swap_image', new File([imageBlob], 'face.jpg', { type: 'image/jpeg' }));

      const headers = new Headers();
      headers.append('Authorization', apiKey);

      const createResponse = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      const result = await createResponse.json();

      if (result.code === 100000) {
        const jobId = result.result.job_id;
        setJobId(jobId);
        // fetchVideo(jobId);
      } else {
        setError(result.message.en);
      }
    } catch (error) {
      setError('Error creating job');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (jobId) {
      startProcess(jobId);
    }
  }, [jobId]);

  //original
  async function startProcess(jobId: any) {
    const url = `https://developer.remaker.ai/api/remaker/v1/face-swap-video/${jobId}`;
    const headers = new Headers();
    headers.append('Authorization', apiKey);

    async function checkProgress() {
      try {
        const response = await fetch(url, { method: 'GET', headers: headers });
        const data = await response.json();

        console.log('data', data);

        if (data.result.progress === 100) {
          console.log('Process is complete! Here is the output:', data.result.output[0]);
          console.log('Thumbnail:', data.result.thumbnail_path);
          setVideoURL(data.result.output[0]);
          setOpacity(1);
          setImageSrc(null);
          setShowWebCam(false);
          setShowPlayer(true);
          setIsProcessing(false);
          clearInterval(intervalId);
          setLoading(false);
        } else {
          console.log(`Current progress: ${data.result.progress}%`);
        }
      } catch (error) {
        setLoading(false);
        console.error('Error fetching API:', error);
        setIsProcessing(false);
      }
    }

    setIsProcessing(true);
    const intervalId = setInterval(checkProgress, 5000);
  }

  const cameraButtonHandler = () => {
    setShowWebCam(true);
    setIsLoading(true);
  };

  const onWebcamLoaded = () => {
    setIsLoading(false);
  };

  const playAgain = () => {
    setVideoURL(MainVideURl);
    setOpacity(1);
    setImageSrc(null);
    setShowWebCam(false);
    setShowPlayer(true);
  };

  return (
    <div>
      <div className="flex flex-col justify-center items-center h-screen">
        {showPlayer && (
          <ReactPlayer
            url={videoURL}
            controls={true}
            playing={true}
            width="100%"
            height="100%"
            onEnded={handleVideoEnd}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: opacity,
              transition: 'opacity 1s ease-out',
            }}
          />
        )}

        {!showPlayer && !showWebCam && !imageSrc && (
          <div>
            <h3 className="text-black text-3xl font-bold">Immerse Yourself in This Experience</h3>
            <button className="" onClick={cameraButtonHandler}>
              <img src={CameraIcon} alt="Close" className="w-16 h-16 cursor-pointer" />
            </button>
            <div className="text-xl font-semibold cursor-pointer" onClick={playAgain}>
              Play Again
            </div>
          </div>
        )}

        {showWebCam && (
          <div className="mt-10">
            <Webcam
              audio={false}
              height={720}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={500}
              videoConstraints={videoConstraints}
              style={{ borderRadius: 30 }}
              onUserMedia={onWebcamLoaded}
            />
            <button className="bg-slate-900 p-3 text-xl text-white rounded-lg mt-5 font-semibold" onClick={captureImage}>
              {isLoading ? <BeatLoader size={8} color="white" /> : 'Take Photo'}
            </button>
          </div>
        )}

        {imageSrc && (
          <div className="mt-4">
            <div className=" rounded-lg mt-2 relative">
              <img src={imageSrc} alt="Captured" className="w-[300px] h-[300px] rounded-[30px]" />
              <button className="absolute top-2 right-5 text-red-500 bg-black rounded-lg" onClick={() => setImageSrc(null)} disabled={loading}>
                <img src={CloseIcon} alt="Close" className="w-4 h-4 cursor-pointer" />
              </button>
              <button
                className="bg-slate-900 p-3 text-xl text-white rounded-lg mt-5 font-semibold min-w-[164px]"
                onClick={createJob}
                disabled={loading}
              >
                {loading ? <BeatLoader size={8} color="white" /> : 'Generate Video'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;

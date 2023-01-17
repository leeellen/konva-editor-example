/**
 *
 * FILE : Editor.tsx
 *
 * DESCRIPTION : 3D 로비, 부스용 에디터 컴포넌트
 *
 * AUTHOR : 이은지 (ellen)
 *
 * DATE : 2022-12-xx
 *
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { css } from '@emotion/react';
import { Button, Radio, Space, Spin, Upload, Modal } from 'antd';
import { RcFile } from 'antd/es/upload';
import { Stage, Layer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import shortid from 'shortid';

import palette from '@src/styles/palette';

import useCustomParams from '@src/hooks/useCustomParams';
import { ImageShapeType, shapesState, TextShapeType, VideoShapeType } from '@src/atoms/shapes';
import { selectShapeState } from '@src/atoms/selectShape';
import { textShapeEditState } from '@src/atoms/textShapeEdit';
import Icons from '@components/icons/index';
import { error } from '@common/CustomToast';
import { Fonts } from '@common/FontProvider';

import Shape from './Shape';
import VideoLayerDataControl from './VideoLayerDataControl';
import ImageLayerDataControl from './ImageLayerDataControl';
import TextLayerDataControl from './TextLayerDataControl';

import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import useToggle from '@src/hooks/useToggle';
import { YOUTUBE_API } from '@src/apis';

const themeList = [
    // 'https://user-images.githubusercontent.com/54742523/211994518-7c9dd006-6eb0-4e92-b2f0-b30aac84d5c5.png',
    // 'https://user-images.githubusercontent.com/54742523/211994527-bedd9340-cd30-4e3b-91ba-1651a6ce4af0.png',
    // 'https://user-images.githubusercontent.com/54742523/211994530-958332ef-5a0c-4e68-9d40-8f47cfc0efb6.png',
    // 'https://user-images.githubusercontent.com/54742523/211994533-94e3f1e0-5280-4478-bb75-bcc596107a52.png',
    // 'https://user-images.githubusercontent.com/54742523/211994518-7c9dd006-6eb0-4e92-b2f0-b30aac84d5c5.png',
    // 'https://user-images.githubusercontent.com/54742523/211994527-bedd9340-cd30-4e3b-91ba-1651a6ce4af0.png',
    // 'https://user-images.githubusercontent.com/54742523/211994530-958332ef-5a0c-4e68-9d40-8f47cfc0efb6.png',
    'https://i.picsum.photos/id/992/1920/960.jpg?hmac=vqA8dhEls-OuFefL8_QTParX5lZupgAIE7SG1yEfdWg',
    'https://i.picsum.photos/id/764/1920/960.jpg?hmac=_1VJEv3EMT0t7hRa6fAfhZ3DrzreSDywGJ_I_0VaaYE',
    'https://i.picsum.photos/id/96/1920/960.jpg?hmac=gC2bg3VcfqhXhvYz4W-jlGS8XWQr1gq4ibx9DZ9hQ2Q',
    'https://i.picsum.photos/id/1050/1920/960.jpg?hmac=hewHGA7i1o1cU0z5nov-Q7dardLqmIU5t2BhgrFAymY',
    'https://i.picsum.photos/id/265/1920/960.jpg?hmac=9rf7lkl8LSXWsXy0iYx5LK1aZp9t7ynqmdLh7ITJho4',
];

const typeToKor = {
    image: '이미지',
    video: '비디오',
    text: '텍스트',
};
const imageLayer =
    'https://user-images.githubusercontent.com/54742523/212263501-d216d180-f33c-4eaa-b958-ebbdb47f320f.png';

const videoLayer =
    'https://user-images.githubusercontent.com/54742523/212624339-9ed51efc-47d7-43a3-9179-ec683e92c0b7.mp4';

export const getCanvasCenter = (containerSize: number, objSize: number) => containerSize / 2 - objSize / 2;

export type DataControlType = {
    updateShapeData: (name: string, value: any) => void;
    beforeUpload?: (file: RcFile, callback: (value: string) => void) => void;
};

type LayerMaxAmount = {
    image: number;
    video: number;
    text: number;
};
type EditorType = {
    type: '로비' | '부스';
    maxAmount: LayerMaxAmount;
};

export default function Editor({ type, maxAmount }: EditorType) {
    const { id: eventId } = useCustomParams();

    const backgroundRef = useRef<any>();
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [currentTheme, setCurrentTheme] = useState(themeList[0]);

    const [shapes, setShapes] = useRecoilState(shapesState);
    const [selectedShape, setSelectedShape] = useRecoilState(selectShapeState);
    const [textEditMode, setTextEditMode] = useRecoilState(textShapeEditState);

    const scale = size.width / 1000;

    console.log('RECOIL', { shapes, selectedShape });

    useLayoutEffect(() => {
        const updateSize = () => {
            const ref = backgroundRef?.current;

            if (ref) {
                const width = ref.offsetWidth;
                const height = ref.offsetHeight;

                setSize({
                    width,
                    height,
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const getLayerCountByType = (layerType: string) => shapes.filter((e) => e.type === layerType).length;

    const beforeUpload = async (file: RcFile, callback: (value: string) => void) => {
        const isVideo = file.type === 'video/mp4';

        const isLt50M = file.size / 1024 / 1024 < 50;
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (isVideo && !isLt50M) {
            error({ content: '비디오 용량은 50MB 보다 작아야합니다.' });
            return false;
        }
        if (!isVideo && !isLt2M) {
            error({ content: '이미지 용량은 2MB 보다 작아야합니다.' });
            return false;
        }

        if (file) {
            const image = 'https://i.picsum.photos/id/15/375/375.jpg?hmac=wqRM0xalP6hd1S9QK8fGmKH7vDO0clkyvqMsprZqxcw';
            const video =
                'https://www.shutterstock.com/shutterstock/videos/1065503581/preview/stock-footage-times-square-new-york-usa-timelapse-of-busy-times-square-as-the-sun-sets.mp4';

            setLoading(true);
            const tempVal = isVideo ? video : image;

            // const uploadedData =await uploadEventFiles({ eventId, file })
            callback(tempVal);
            // callback(uploadedData)

            setLoading(false);

            return false;
        }
        return true;
    };

    const createImageShape = () => {
        const newImageShape: ImageShapeType = {
            id: shortid.generate(),
            type: 'image',
            title: '',
            x: getCanvasCenter(size.width, 224),
            y: getCanvasCenter(size.height, 126),
            width: 224,
            height: 126,
            value: imageLayer,
            purpose: 'file',
            file: new File([], ''),
            link: '',
        };

        setSelectedShape(newImageShape);
        setShapes([...shapes, newImageShape]);
    };

    const createVideoShape = () => {
        const newVideoShape: VideoShapeType = {
            id: shortid.generate(),
            type: 'video',
            title: '',
            x: getCanvasCenter(size.width, 224),
            y: getCanvasCenter(size.height, 126),
            width: 224,
            height: 126,
            value: videoLayer,
            mp4File: new File([], ''),
        };

        setSelectedShape(newVideoShape);
        setShapes([...shapes, newVideoShape]);
    };
    const createTextShape = () => {
        const newTextShape: TextShapeType = {
            id: shortid.generate(),
            type: 'text',
            title: '',
            width: 100,
            height: 50,
            x: getCanvasCenter(size.width, 100),
            y: getCanvasCenter(size.height, 50),
            text: '텍스트',
            fontSize: 24,
            fontFamily: 'NanumSquareRound',
            fill: '#000',
            fontStyle: 'normal',
            textDecoration: 'none',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 0,
            shadowOpacity: 0,
            lineHeight: 0,
        };

        setSelectedShape(newTextShape);
        setShapes([...shapes, newTextShape]);
    };

    const updateShapeData = (name: string, value: any) => {
        if (!selectedShape) return;

        setSelectedShape({ ...selectedShape, [name]: value });
        setShapes(shapes.map((s) => (s.id === selectedShape.id ? { ...s, [name]: value } : s)));
    };

    const deleteShape = () => {
        selectedShape && setShapes(shapes.filter((e) => e.id !== selectedShape.id));
        setSelectedShape(undefined);
    };

    const deSelectShape = (e: KonvaEventObject<TouchEvent | MouseEvent>) => {
        e.target === e.target.getStage() && setSelectedShape(undefined);
        setTextEditMode(false);
    };

    return (
        <>
            <Fonts />
            <section>
                <label data-required="true">{type} 테마</label>

                <div
                    css={css`
                        max-width: 888px;
                        width: 100%;
                    `}
                >
                    <div className="ds-flex jc-sb mb-20">
                        <p className="fw-500 fs-13 gray6 mb-8 lh-19">
                            원하시는 테마를 선택하시거나 이미지를 업로드 해주세요.
                            <br />
                            이미지 비율은 2:1 비율의 가로 1920px 이상의 이미지가 적절해요.
                        </p>

                        <Button size="small" icon={<Icons icon="calculate_plus" />}>
                            테마 이미지 추가
                        </Button>
                    </div>

                    <div css={themeSliderCss}>
                        <Swiper
                            spaceBetween={12}
                            slidesPerView={4}
                            loop={true}
                            navigation={true}
                            modules={[Navigation]}
                            onInit={(swiper: any) => {
                                swiper.params.navigation.prevEl = prevRef.current;
                                swiper.params.navigation.nextEl = nextRef.current;
                                swiper.navigation.init();
                                swiper.navigation.update();
                            }}
                        >
                            {themeList.map((e) => (
                                <SwiperSlide key={e}>
                                    <button
                                        className={currentTheme === e ? 'theme active' : 'theme'}
                                        onClick={() => setCurrentTheme(e)}
                                        type="button"
                                    >
                                        <img src={e} />
                                    </button>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <div className="nav-btns">
                            <button ref={prevRef} type="button">
                                <Icons icon="chevron_left" />
                            </button>
                            <button ref={nextRef} type="button">
                                <Icons icon="chevron_right" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <label data-required="true">3D {type} 설정</label>

                <div
                    css={css`
                        max-width: 888px;
                        width: 100%;
                    `}
                >
                    <p className="fw-500 fs-13 gray6 mb-16 lh-19">원하시는 레이어를 부스 안에 추가할 수 있어요.</p>
                    <div css={canvasCss}>
                        <div className="canvasWrapper">
                            <img src={currentTheme} alt="3D background" className="background" ref={backgroundRef} />
                            <div className="container">
                                <Stage
                                    width={size.width}
                                    height={size.height}
                                    scaleX={scale}
                                    scaleY={scale}
                                    onMouseDown={deSelectShape}
                                    onTouchStart={deSelectShape}
                                >
                                    <Layer>
                                        {shapes.map((s) => (
                                            <Shape key={s.id} data={s} />
                                        ))}
                                    </Layer>
                                </Stage>
                            </div>

                            {loading && (
                                <div
                                    css={css`
                                        position: absolute;
                                        top: 0px;
                                        left: 0px;
                                        width: 100%;
                                        height: 100%;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        background-color: rgba(255, 255, 255, 0.5);
                                    `}
                                >
                                    <Spin size="large" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div css={addLayerCss}>
                        <Space size={16}>
                            <Button
                                size="large"
                                icon={<Icons icon="addphoto_20" />}
                                disabled={getLayerCountByType('image') === maxAmount.image}
                                onClick={createImageShape}
                            >
                                이미지 레이어
                                <span className="count" data-count={getLayerCountByType('image')}>
                                    {getLayerCountByType('image')}
                                </span>
                                <span className="max">/{maxAmount.image}</span>
                            </Button>

                            <Button
                                size="large"
                                icon={<Icons icon="video_20" />}
                                disabled={getLayerCountByType('video') === maxAmount.video}
                                onClick={createVideoShape}
                            >
                                동영상 레이어
                                <span className="count" data-count={getLayerCountByType('video')}>
                                    {getLayerCountByType('video')}
                                </span>
                                <span className="max">/{maxAmount.video}</span>
                            </Button>

                            <Button
                                size="large"
                                icon={<Icons icon="text_20" />}
                                disabled={getLayerCountByType('text') === maxAmount.text}
                                onClick={createTextShape}
                            >
                                텍스트 레이어
                                <span className="count" data-count={getLayerCountByType('text')}>
                                    {getLayerCountByType('text')}
                                </span>
                                <span className="max">/{maxAmount.text}</span>
                            </Button>
                        </Space>
                    </div>

                    {selectedShape && (
                        <div css={layerDataCss}>
                            <Button
                                icon={<Icons icon="trash" />}
                                onClick={deleteShape}
                                size="small"
                                css={css`
                                    border-radius: 4px !important;
                                `}
                            >
                                레이어 삭제하기
                            </Button>

                            <div className="data-control">
                                {selectedShape?.type === 'image' && (
                                    <ImageLayerDataControl
                                        updateShapeData={updateShapeData}
                                        beforeUpload={beforeUpload}
                                    />
                                )}
                                {selectedShape?.type === 'video' && (
                                    <VideoLayerDataControl
                                        updateShapeData={updateShapeData}
                                        beforeUpload={beforeUpload}
                                    />
                                )}
                                {selectedShape?.type === 'text' && (
                                    <TextLayerDataControl updateShapeData={updateShapeData} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

const themeSliderCss = css`
    position: relative;

    .swiper-button-prev,
    .swiper-button-next {
        display: none;
    }

    /* theme image */
    .theme {
        width: 100%;
        padding: 4px;
        border: 2px solid transparent;
        outline: none;
        transition: all 0.3s;

        &.active {
            border: 2px solid #fb5c30;
        }
        &:hover {
            border: 2px solid #fb5c30;
        }
    }

    img {
        width: 100%;
        display: block;
    }

    /* slider arrows */
    .nav-btns {
        button {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
        }
        button:nth-of-type(1) {
            left: -45px;
        }
        button:nth-of-type(2) {
            right: -45px;
        }

        svg {
            cursor: pointer;
            color: ${palette.gray.gray6};
            background: none;
            border-radius: 20px;
            width: 25px;
            height: 25px;
            border: 1px solid ${palette.gray.gray3};

            &:hover {
                color: #000;
                background: none;
            }
        }
    }
`;

const canvasCss = css`
    width: 100%;
    display: flex;
    flex-direction: column;

    .canvasWrapper {
        position: relative;
        padding-bottom: 50%;
        width: 100%;
    }

    .background {
        position: absolute;
        top: 0px;
        left: 0px;
        height: 100%;
        width: 100%;
        pointer-events: none;
    }

    .container {
        position: absolute;
    }
`;

const addLayerCss = css`
    margin: 24px 0;

    span {
        font-weight: 500;
        font-size: 15px;
        line-height: 19px;
    }

    .count,
    .max {
        color: ${palette.gray.gray8};
    }
    .count[data-count='0'] {
        color: ${palette.gray.gray5};
    }

    button:hover {
        span {
            color: #ff8359 !important;
        }
    }

    button:disabled {
        span {
            color: #a8a8a8 !important;
        }
    }
`;

const layerDataCss = css`
    margin-top: 16px;

    .data-control {
        margin-top: 32px;

        section {
            display: block;
            margin-bottom: 32px;
        }

        section:last-child {
            margin: 0;
        }

        label {
            font-weight: 600;
            font-size: 16px;
            line-height: 20px;
            color: ${palette.gray.gray8};
            margin-bottom: 16px;
        }
    }
`;

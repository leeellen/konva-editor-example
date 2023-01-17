/**
 *
 * FILE : VideoShape.tsx
 *
 * DESCRIPTION : Reference : https://codesandbox.io/s/react-konva-video-on-canvas-oygvf?file=/src/index.js
 *               react-konva video shape
 *
 * AUTHOR : 이은지 (ellen)
 *
 * DATE : 2022-11-28
 *
 */
import { useEffect, useMemo } from 'react';
import Konva from 'konva';
import { Image } from 'react-konva';

import { VideoShapeType } from '@src/atoms/shapes';
import { ShapeProps } from './Shape';
import { Html } from 'react-konva-utils';

type VideoShapeProps = ShapeProps & {
    data: VideoShapeType;
};

export default function VideoShape({ data, shapeRef, onSelect, onDragEnd, onTransformEnd }: VideoShapeProps) {
    const { x, y, width, height } = data;

    // we need to use "useMemo" here, so we don't create new video elment on any render
    const videoElement = useMemo(() => {
        const element = document.createElement('video');
        element.src = data.value;

        return element;
    }, [data.value]);

    // use Konva.Animation to redraw a layer
    useEffect(() => {
        videoElement.loop = true;
        videoElement.muted = true;
        videoElement.play();

        const layer = shapeRef.current.getLayer();
        const anim = new Konva.Animation(() => {}, layer);
        anim.start();

        return () => {
            anim.stop();
        };
    }, [videoElement]);

    return (
        <Image
            draggable
            ref={shapeRef}
            image={videoElement}
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
            {...data}
        />
    );
}

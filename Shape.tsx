/**
 *
 * FILE : Shape
 *
 * DESCRIPTION : 캔버스 shape 관리 컴포넌트
 *
 * AUTHOR : 이은지 (ellen)
 *
 * DATE : 2022-12-xx
 *
 */
import { useEffect, useRef } from 'react';
import { useRecoilState } from 'recoil';
import { Transformer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';

import VideoShape from './VideoShape';
import ImageShape from './ImageShape';
import TextShape from './TextShape';
import { Box } from 'konva/lib/shapes/Transformer';
import { selectShapeState } from '@src/atoms/selectShape';
import { textShapeEditState } from '@src/atoms/textShapeEdit';
import { ImageShapeType, shapesState, ShapeType, TextShapeType, VideoShapeType } from '@src/atoms/shapes';

export type ShapeProps = {
    data: ShapeType;
    shapeRef: React.MutableRefObject<any>;
    onSelect: () => void;
    onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
    onTransformEnd: (e: KonvaEventObject<Event>) => void;
};
export default function Shape({ data }: { data: ShapeType }) {
    const shapeRef = useRef<any>();
    const transformerRef = useRef<any>();

    const [shapes, setShapes] = useRecoilState(shapesState);
    const [selectedShape, setSelectedShape] = useRecoilState(selectShapeState);
    const [textEditMode] = useRecoilState(textShapeEditState);

    const isSelected = data.id === selectedShape?.id;

    useEffect(() => {
        if (isSelected) {
            transformerRef.current.nodes([shapeRef.current]);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const onSelect = () => setSelectedShape(data);

    const onDragEnd = (e: KonvaEventObject<DragEvent>) =>
        setShapes(
            shapes.map((shape) => (shape.id === data.id ? { ...shape, x: e.target.x(), y: e.target.y() } : shape)),
        );

    const onTransformEnd = (e: any) => {
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // we will reset it back
        node.scaleX(1);
        node.scaleY(1);

        setShapes(
            shapes.map((shape) =>
                shape.id === data.id
                    ? {
                          ...shape,
                          x: node.x(),
                          y: node.y(),
                          width: Math.max(5, node.width() * scaleX),
                          height: Math.max(node.height() * scaleY),
                      }
                    : shape,
            ),
        );
    };

    const onChangeText = (e: React.FormEvent<HTMLDivElement>) => {
        const { offsetWidth: width, offsetHeight: height, innerText: value } = e.currentTarget;

        setShapes(
            shapes.map((shape) =>
                shape.id === data.id
                    ? {
                          ...shape,
                          width,
                          height,
                          value,
                      }
                    : shape,
            ),
        );
    };

    const onTextTransform = (e: any) => {
        if (shapeRef.current !== null) {
            const textNode = shapeRef.current;
            const scaleX = textNode.scaleX();
            const scaleY = textNode.scaleY();
            const width = textNode.width() * textNode.scaleX();
            const height = textNode.height() * textNode.scaleY();
            const fontSize = textNode.fontSize() * scaleX;

            textNode.setAttrs({
                width: Math.max(textNode.width() * textNode.scaleX(), 20),
                scaleX: 1,
                scaleY: 1,
            });

            setShapes(
                shapes.map((shape) =>
                    shape.id === data.id
                        ? {
                              ...shape,
                              width,
                              height,
                              fontSize,
                              textWidth: Math.max(5, textNode.width() * scaleX),
                              textHeight: Math.max(textNode.height() * scaleY),
                          }
                        : shape,
                ),
            );
        }
    };

    const shapeProps = {
        data,
        shapeRef,
        onSelect,
        onDragEnd,
        onTransformEnd,
    };

    return (
        <>
            {data.type === 'video' && <VideoShape {...shapeProps} data={data as VideoShapeType} />}
            {data.type === 'image' && <ImageShape {...shapeProps} data={data as ImageShapeType} />}
            {data.type === 'text' && (
                <TextShape
                    {...shapeProps}
                    onChangeText={onChangeText}
                    onTextTransform={onTextTransform}
                    data={data as TextShapeType}
                />
            )}

            {!textEditMode && isSelected && (
                <Transformer
                    ref={transformerRef}
                    rotateAnchorOffset={25}
                    keepRatio={true}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                    anchorStroke="#FB5C3099"
                    anchorFill="#FB5C3099"
                    anchorSize={8}
                    borderStroke="#FB5C30"
                    anchorCornerRadius={50}
                    boundBoxFunc={(oldBox: Box, newBox: Box) =>
                        newBox.width < 5 || newBox.height < 5 ? oldBox : newBox
                    }
                />
            )}
        </>
    );
}

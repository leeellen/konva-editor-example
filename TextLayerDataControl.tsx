/**
 *
 * FILE : TextLayerDataControl
 *
 * DESCRIPTION : 텍스트 레이어 데이터 조작 컴포넌트
 *
 * AUTHOR : 이은지 (ellen)
 *
 * DATE : 2023-01-13
 *
 */
import { css } from '@emotion/react';
import { Input, RadioChangeEvent, Select, Space } from 'antd';
import { palette } from '@maydaydevteam/yeeeyes-design';

import { fontFamilyList } from '@common/FontProvider';
import FontIcons from '@components/icons/fontIcon';
import Icons, { IconsType } from '@components/icons';
import { DataControlType } from '.';
import { useRecoilState } from 'recoil';
import { selectShapeState } from '@src/atoms/selectShape';
import useImageUpload from '@src/hooks/useImageUpload';
import { shapesState, TextShapeType } from '@src/atoms/shapes';
import styled from '@emotion/styled';

const fontStyleList: IconsType[] = ['bold', 'italic'];
const textDecoList = ['underline', 'line-through'];
const linethroughParse: any = { underline: 'underline', 'line-through': 'lineThrough' };

export default function TextLayerDataControl({ updateShapeData }: DataControlType) {
    const [shapes, setShapes] = useRecoilState(shapesState);
    const [selectedShape, setSelectedShape] = useRecoilState(selectShapeState);
    if (!selectedShape) return <></>;

    const onChange = (e: React.ChangeEvent<HTMLInputElement> | RadioChangeEvent) => {
        const { name, value } = e.target;
        if (!name) return;

        updateShapeData(name, value);
    };

    const onClickTextShadow = (current: boolean) => {
        const shadowOff = {
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 0,
            shadowOpacity: 0,
        };
        const shadowOn = {
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            shadowBlur: 8,
            shadowOpacity: 0.2,
        };
        const newShadowValue = current ? shadowOff : shadowOn;

        setSelectedShape({ ...selectedShape, ...newShadowValue });
        setShapes(shapes.map((s) => (s.id === selectedShape.id ? { ...s, ...newShadowValue } : s)));
    };

    const { text, fontFamily, link, fontStyle, textDecoration, shadowBlur } = selectedShape as TextShapeType;

    return (
        <>
            <section>
                <label>1. 텍스트를 입력해 주세요.</label>
                <Input
                    name="text"
                    placeholder="제목을 입력해주세요."
                    css={css`
                        width: 360px;
                    `}
                    value={text}
                    onChange={onChange}
                />
            </section>

            <section
                css={css`
                    display: flex !important;
                    flex-direction: column;
                    gap: 16px !important;
                `}
            >
                <label>2. 글꼴 스타일을 지정해 주세요.</label>

                <div>
                    <p className="gray6 fs-13 fw-500 mb-8">2-1. 글꼴 종류</p>
                    <Select
                        size="large"
                        suffixIcon={<Icons icon="chevron_down" color={palette.gray.gray10} />}
                        css={css`
                            width: 360px;
                        `}
                        value={fontFamily}
                        onChange={(value) => updateShapeData('fontFamily', value)}
                    >
                        {fontFamilyList.map((e) => (
                            <Select.Option key={e.key} value={e.key}>
                                <p
                                    css={css`
                                        height: 38px;
                                        display: flex;
                                        align-items: center;
                                        font-family: ${e.key};
                                    `}
                                >
                                    <FontIcons icon={e.icon} />
                                </p>
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <div
                    css={css`
                        button {
                            width: 32px;
                            height: 32px;
                        }
                    `}
                >
                    <p className="gray6 fs-13 fw-500 mb-8">2-2. 컬러</p>
                    <div className="ds-flex fd-c width-fit ai-c">
                        <p className="gray4 fs-13 fw-500 mb-4">텍스트</p>
                        <input name="fill" type="color" defaultValue="#000" css={colorPickerCss} onChange={onChange} />
                    </div>
                </div>

                <div>
                    <p className="gray6 fs-13 fw-500 mb-8">2-3. 스타일 및 효과</p>
                    <Space size={12}>
                        {fontStyleList.map((f) => (
                            <TextStyleButton
                                key={f}
                                type="button"
                                select={fontStyle === f}
                                onClick={() => updateShapeData('fontStyle', fontStyle === f ? 'normal' : f)}
                            >
                                <Icons icon={f} color={palette.gray.gray6} />
                            </TextStyleButton>
                        ))}
                        {textDecoList.map((d) => (
                            <TextStyleButton
                                key={d}
                                type="button"
                                select={textDecoration === d}
                                onClick={() => updateShapeData('textDecoration', textDecoration === d ? 'none' : d)}
                            >
                                <Icons icon={linethroughParse[d]} color={palette.gray.gray6} />
                            </TextStyleButton>
                        ))}
                        <TextStyleButton
                            type="button"
                            select={shadowBlur > 0}
                            onClick={() => onClickTextShadow(shadowBlur > 0)}
                        >
                            <Icons icon="shadow" color={palette.gray.gray6} />
                        </TextStyleButton>
                    </Space>
                </div>
            </section>

            <section>
                <label>3. 링크를 추가하고 싶으시면 입력해 주세요.</label>
                <Input
                    name="link"
                    value={link}
                    onChange={onChange}
                    placeholder="웹 링크를 입력해주세요."
                    css={css`
                        width: 360px;
                    `}
                />
            </section>
        </>
    );
}

const colorPickerCss = css`
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 42px;
    height: 42px;
    background-color: transparent;
    border: none;
    cursor: pointer;

    &::-webkit-color-swatch {
        border-radius: 4px;
        border: 1px solid #c8c8c8;
    }
    &::-moz-color-swatch {
        border-radius: 4px;
        border: 1px solid #c8c8c8;
    }
`;

const TextStyleButton = styled.button<{ select: boolean }>`
    padding: 0px;
    width: 40px;
    height: 40px;
    outline: none;

    svg,
    rect,
    path {
        transition: all 0.2s;
    }

    ${({ select }) => {
        if (select) {
            return css`
                rect {
                    stroke: ${palette.gray.gray8};
                    stroke-width: 2px;
                }

                path {
                    fill: ${palette.gray.gray8};
                }
            `;
        }
    }}
`;

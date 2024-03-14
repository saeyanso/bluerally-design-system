import styled from '@emotion/styled';
import dayjs from 'dayjs';
import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { LabeledComponentType } from '@/@types/LabeledComponentType';

import { DateTimeFormat, formatter } from '@/utils/formatter';

import { LabeledComponentWrapper } from '../@common/LabeledComponentWrapper';
import { Calendar } from '../Calendar';
import { Icon } from '../Icon';
import { Overlay as OverlayBase } from '../Overlay';
import { OverlayDimmedWrapper } from '../Overlay/OverlayWrapper';
import { TextInput } from '../TextInput';

const SEPARATOR = '~';

export enum DatePickerIndex {
  START_DATE,
  END_DATE,
}

export type DateRangeType = [string?, string?];

type DateType<T> = T extends true ? DateRangeType : string;

export interface DatePickerProps<T> extends LabeledComponentType {
  isTime?: T extends true ? false : boolean;
  isRange?: T;
  width?: number | string;
  placeholder?: string;
  open?: boolean;
  onOpen?: (open: boolean) => void;
  value?: DateType<T>;
  onChange?: (value: DateType<T>, inputChanged?: boolean) => void;
  onEnterInput?: () => void;
  inputRef?: MutableRefObject<HTMLInputElement | null>;
  time?: string;
  onChangeTime?: (value: string, inputChanged?: boolean) => void;
  onEnterTime?: () => void;
  isAttachRoot?: boolean;
  disabled?: boolean;
  startYear?: number;
  endYear?: number;
}

export const DatePicker = <T extends boolean = false>({
  isTime = false,
  isRange,
  width = 311,
  placeholder = '',
  open: openProp,
  onOpen,
  value,
  onChange,
  onEnterInput,
  inputRef: inputRefProp,
  time: timeProp,
  onChangeTime,
  onEnterTime,
  status,
  name,
  label,
  statusMessage,
  description,
  isAttachRoot,
  disabled,
  required,
  startYear,
  endYear,
}: DatePickerProps<T>) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [time, setTime] = useState('');
  const inputRef = useRef<HTMLInputElement | undefined>(
    null,
  ) as MutableRefObject<HTMLInputElement | null>;
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);

  const openCalendar = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      onOpen?.(isOpen);
    },
    [onOpen],
  );

  useEffect(() => {
    if (disabled) {
      openCalendar(false);

      return;
    }
  }, [disabled, openCalendar]);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    const handleEnterInput = (e: KeyboardEvent): void => {
      if (onEnterInput && e.key === 'Enter') {
        e.preventDefault();
        onEnterInput();
        openCalendar(false);
      }
    };

    inputRef.current.addEventListener('keydown', handleEnterInput);

    return () => {
      inputRef.current?.removeEventListener('keydown', handleEnterInput);
    };
  }, [onEnterInput, openCalendar]);

  useEffect(() => {
    const timeRefElement = timeRef.current;

    if (!timeRefElement) {
      return;
    }

    const handleEnterTime = (e: KeyboardEvent): void => {
      if (onEnterTime && e.key === 'Enter') {
        e.preventDefault();
        onEnterTime();
        openCalendar(false);
      }
    };

    timeRefElement.addEventListener('keydown', handleEnterTime);

    return () => {
      timeRefElement?.removeEventListener('keydown', handleEnterTime);
    };
  }, [onEnterTime, openCalendar]);

  const handleClick = (date: string) => {
    setSelectedDate(date);

    if (isRange) {
      if (!Array.isArray(value)) {
        changeValue([date, ''] as string[] as DateType<T>);

        return;
      }
      const [startDate, endDate] = value;
      const newSelectedRange =
        !startDate || endDate ? [date, ''] : [startDate, date];
      const [newStartDate, newEndDate] = newSelectedRange;

      if (newEndDate && newStartDate > newEndDate) {
        newSelectedRange.reverse();
      }

      changeValue(newSelectedRange as DateType<T>);

      openCalendar(!newEndDate);

      return;
    }

    if (isTime) {
      changeValue(
        formatter.dateTime(`${date} ${time || timeProp || ''}`) as DateType<T>,
      );
      timeRef.current?.focus();
      return;
    }

    changeValue(date as DateType<T>);
    openCalendar(false);
  };

  const changeValue = (value: DateType<T>, inputChanged: boolean = false) => {
    onChange?.(value, inputChanged);
  };

  const changeTime = (value: string, inputChanged: boolean = false) => {
    setTime(value);
    onChangeTime?.(value, inputChanged);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    changeValue(
      (isRange
        ? (value.split(SEPARATOR).map((v) => v.trim()) as DateRangeType)
        : value) as DateType<T>,
      true,
    );
    openCalendar(false);
  };

  const handleChangeTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    const defaultDate = formatter.date(dayjs());
    changeTime(newTime, true);

    if (
      !dayjs(
        `${selectedDate || defaultDate} ${newTime}`,
        DateTimeFormat.DATE_TIME,
      ).isValid()
    ) {
      return;
    }

    changeValue(
      formatter.dateTime(
        `${selectedDate || defaultDate} ${newTime}`,
      ) as DateType<T>,
    );
  };

  const calcDate = (newValue?: DateType<T>) => {
    const date = newValue || value;
    if (isRange && Array.isArray(date)) {
      const [start = '', end = ''] = date;
      const newSelectedRange = [
        dayjs(start, DateTimeFormat.DATE, true).isValid()
          ? formatter.date(start)
          : '',
        dayjs(end, DateTimeFormat.DATE, true).isValid()
          ? formatter.date(end)
          : '',
      ];
      const [newStartDate, newEndDate] = newSelectedRange;

      if (newEndDate && newStartDate > newEndDate) {
        newSelectedRange.reverse();
      }

      changeValue(newSelectedRange as DateType<T>);
      return;
    }

    if (date === '') {
      changeValue('' as DateType<T>);
      setSelectedDate('');

      return;
    }

    const newDate = dayjs((date as string) || dayjs());

    if (!newDate.isValid()) {
      changeValue('' as DateType<T>);
      setSelectedDate('');

      return;
    }

    setSelectedDate(formatter.date(newDate));

    if (isTime) {
      changeValue(formatter.dateTime(newDate) as DateType<T>);
      changeTime(newDate.format('HH:mm'));
      return;
    }

    changeValue(formatter.date(newDate) as DateType<T>);
  };

  const handleOpen = () => {
    if (disabled) {
      return;
    }

    openCalendar(true);
    calcDate();
  };

  return (
    <LabeledComponentWrapper
      status={status}
      name={name}
      width={width}
      label={label}
      statusMessage={statusMessage}
      description={description}
      required={required}
    >
      <Container width={width}>
        <TextInput
          containerStyle={{ position: 'relative', overflow: 'unset' }}
          inputRef={(ref) => {
            inputRef.current = ref;

            if (inputRefProp) {
              inputRefProp.current = ref;
            }
          }}
          value={
            Array.isArray(value)
              ? value[0] && value.join(` ${SEPARATOR} `)
              : value
          }
          containerRef={inputContainerRef}
          onBlur={(e) => {
            const value = e.target.value;
            const newValue = (
              isRange
                ? (value.split(SEPARATOR).map((v) => v.trim()) as DateRangeType)
                : value
            ) as DateType<T>;
            calcDate(newValue);
          }}
          endIcon={
            <CalendarIcon
              icon="calendar"
              disabled={disabled}
              onClick={handleOpen}
            />
          }
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
        />
        {(openProp || open) && (
          <OverlayDimmedWrapper isAttachRoot={isAttachRoot}>
            <Overlay
              open={openProp ?? open}
              anchorRef={inputContainerRef}
              gap={17}
              side="bottom"
              ignoreClickRefs={[inputContainerRef]}
              onClickOutside={() => openCalendar(false)}
              isAttachRoot={isAttachRoot}
            >
              <Calendar
                defaultDate={
                  Array.isArray(value) ? value[1] || value[0] : selectedDate
                }
                info={
                  isRange && Array.isArray(value)
                    ? [
                        value[1]
                          ? {
                              startDate: value[0],
                              endDate: value[1],
                            }
                          : { date: value[0], active: true },
                      ]
                    : [{ date: selectedDate, active: true }]
                }
                onClick={handleClick}
                startYear={startYear}
                endYear={endYear}
              />
              {isTime && (
                <TimeContainer>
                  <TimeTitle>시간</TimeTitle>
                  <TextInput
                    value={time || timeProp}
                    inputRef={timeRef}
                    onChange={handleChangeTime}
                    onBlur={() => {
                      calcDate();
                    }}
                    placeholder="00:00 시간 입력"
                  />
                </TimeContainer>
              )}
            </Overlay>
          </OverlayDimmedWrapper>
        )}
      </Container>
    </LabeledComponentWrapper>
  );
};

const Container = styled('div')<{
  width?: string | number;
}>`
  ${({ width }) =>
    `width: ${typeof width === 'number' ? `${width}px` : width}`};
  min-height: 42px;
`;

const Overlay = styled(OverlayBase)`
  background: ${({ theme }) => theme.palette.white};
  outline: 1px solid ${({ theme }) => theme.palette.gray['200']};
  border-radius: 8px;

  padding: ${({ theme }) => `${theme.spacing(12)} ${theme.spacing(8)}`};
`;

const CalendarIcon = styled(Icon)<{ disabled?: boolean }>`
  ${({ disabled, theme }) => {
    if (!disabled) {
      return;
    }

    return `
    background: ${theme.palette.gray['200']};
    cursor: not-allowed;
    `;
  }}
`;

const TimeContainer = styled('div')`
  padding: ${({ theme }) => `${theme.spacing(5)} ${theme.spacing(2)}`};
`;

const TimeTitle = styled('div')`
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  ${({ theme }) => theme.typography.basic.medium};
`;

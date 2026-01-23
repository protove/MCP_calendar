"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, X } from "lucide-react";

/**
 * Select 컴포넌트 - 우주 테마 셀렉트 드롭다운
 * 
 * 특징:
 * - 우주 테마에 맞는 반투명 드롭다운
 * - 부드러운 열기/닫기 애니메이션
 * - 키보드 네비게이션 지원
 * - 검색/필터 기능 (선택적)
 */

/* Select 스타일 variants */
const selectVariants = cva(
  [
    "relative flex items-center justify-between w-full",
    "bg-cosmic-dark/60 backdrop-blur-sm",
    "border border-cosmic-blue/30 rounded-lg",
    "text-cosmic-white",
    "transition-all duration-300 ease-out",
    "focus:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-base",
      },
      state: {
        default: [
          "hover:border-cosmic-light/50",
          "focus:border-cosmic-light focus:shadow-[0_0_15px_rgba(128,173,191,0.4)]",
        ].join(" "),
        error: [
          "border-cosmic-red/60",
          "focus:border-cosmic-red focus:shadow-[0_0_15px_rgba(115,60,60,0.5)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      size: "default",
      state: "default",
    },
  }
);

/* Option 타입 정의 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

/* Select Props 타입 */
export interface SelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof selectVariants> {
  /** 옵션 목록 */
  options: SelectOption[];
  /** 현재 선택된 값 */
  value?: string;
  /** 값 변경 핸들러 */
  onChange?: (value: string) => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 에러 메시지 */
  error?: string;
  /** 검색 기능 활성화 */
  searchable?: boolean;
  /** 클리어 버튼 표시 */
  clearable?: boolean;
  /** 레이블 */
  label?: string;
}

/**
 * Select 컴포넌트
 * 
 * @example
 * <Select
 *   options={[
 *     { value: "1", label: "옵션 1" },
 *     { value: "2", label: "옵션 2" },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 *   placeholder="선택하세요"
 * />
 */
const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      className,
      options,
      value,
      onChange,
      placeholder = "선택하세요",
      disabled = false,
      error,
      size,
      state,
      searchable = false,
      clearable = false,
      label,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    // 선택된 옵션 찾기
    const selectedOption = options.find((opt) => opt.value === value);

    // 필터링된 옵션
    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // 에러가 있으면 error state 적용
    const selectState = error ? "error" : state;

    // 드롭다운 열기/닫기
    const toggleOpen = () => {
      if (!disabled) {
        setIsOpen((prev) => !prev);
        if (!isOpen) {
          setSearchQuery("");
          setHighlightedIndex(-1);
        }
      }
    };

    // 옵션 선택
    const handleSelect = (optionValue: string) => {
      if (onChange) {
        onChange(optionValue);
      }
      setIsOpen(false);
      setSearchQuery("");
    };

    // 선택 초기화
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onChange) {
        onChange("");
      }
    };

    // 키보드 네비게이션
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case "Enter":
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const option = filteredOptions[highlightedIndex];
            if (option && !option.disabled) {
              handleSelect(option.value);
            }
          } else {
            toggleOpen();
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : prev
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          }
          break;
      }
    };

    // 외부 클릭 감지
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 드롭다운 열릴 때 검색 입력에 포커스
    React.useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    return (
      <div ref={ref} className={cn("relative w-full", className)} {...props}>
        {/* 레이블 */}
        {label && (
          <label className="block text-sm font-medium text-cosmic-gray mb-1.5">
            {label}
          </label>
        )}

        {/* 셀렉트 트리거 */}
        <div
          ref={containerRef}
          className={cn(
            selectVariants({ size, state: selectState }),
            "cursor-pointer",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={toggleOpen}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={disabled}
        >
          {/* 선택된 값 또는 플레이스홀더 */}
          <span
            className={cn(
              "flex-1 truncate text-left",
              !selectedOption && "text-cosmic-gray/60"
            )}
          >
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon}
                {selectedOption.label}
              </span>
            ) : (
              placeholder
            )}
          </span>

          {/* 아이콘 영역 */}
          <div className="flex items-center gap-1 ml-2">
            {/* 클리어 버튼 */}
            {clearable && value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 rounded hover:bg-cosmic-blue/20 text-cosmic-gray hover:text-cosmic-white transition-colors"
                aria-label="선택 초기화"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* 화살표 아이콘 */}
            <ChevronDown
              className={cn(
                "w-4 h-4 text-cosmic-gray transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </div>

        {/* 드롭다운 옵션 */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute z-50 w-full mt-1",
                "bg-cosmic-dark/95 backdrop-blur-md",
                "border border-cosmic-blue/30 rounded-lg",
                "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
                "overflow-hidden"
              )}
              role="listbox"
            >
              {/* 검색 입력 */}
              {searchable && (
                <div className="p-2 border-b border-cosmic-blue/20">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="검색..."
                    className={cn(
                      "w-full px-3 py-2",
                      "bg-cosmic-dark/60 rounded-md",
                      "border border-cosmic-blue/20",
                      "text-cosmic-white placeholder:text-cosmic-gray/50",
                      "text-sm",
                      "focus:outline-none focus:border-cosmic-light/50"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {/* 옵션 리스트 */}
              <div className="max-h-60 overflow-y-auto py-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-cosmic-gray text-center">
                    검색 결과가 없습니다
                  </div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        if (!option.disabled) {
                          handleSelect(option.value);
                        }
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        "flex items-center justify-between px-4 py-2.5 cursor-pointer",
                        "transition-colors duration-150",
                        option.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-cosmic-blue/20",
                        highlightedIndex === index && "bg-cosmic-blue/20",
                        option.value === value && "bg-cosmic-blue/30"
                      )}
                      role="option"
                      aria-selected={option.value === value}
                      aria-disabled={option.disabled}
                    >
                      <span className="flex items-center gap-2 text-cosmic-white">
                        {option.icon}
                        {option.label}
                      </span>

                      {/* 선택 체크 아이콘 */}
                      {option.value === value && (
                        <Check className="w-4 h-4 text-cosmic-gold" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 에러 메시지 */}
        {error && (
          <p className="mt-1.5 text-sm text-cosmic-red">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };

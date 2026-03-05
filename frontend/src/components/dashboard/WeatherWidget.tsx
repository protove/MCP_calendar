"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CloudSun, 
  Shirt, 
  Droplets, 
  Wind, 
  Thermometer,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  CloudFog,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { weatherApi } from "@/lib/api";
import { WeatherData, WeatherCondition } from "@/types";

// 날씨 조건에 따른 아이콘 반환
function getWeatherIcon(condition: WeatherCondition) {
  const iconClass = "h-16 w-16";
  
  switch (condition) {
    case "sunny":
      return <Sun className={`${iconClass} text-cosmic-gold`} />;
    case "cloudy":
      return <Cloud className={`${iconClass} text-cosmic-gray`} />;
    case "partly-cloudy":
      return <CloudSun className={`${iconClass} text-cosmic-gold`} />;
    case "rainy":
      return <CloudRain className={`${iconClass} text-cosmic-light`} />;
    case "snowy":
      return <Snowflake className={`${iconClass} text-cosmic-white`} />;
    case "foggy":
      return <CloudFog className={`${iconClass} text-cosmic-gray`} />;
    default:
      return <CloudSun className={`${iconClass} text-cosmic-gold`} />;
  }
}

// 날씨 조건에 따른 배경 그라데이션
function getWeatherGradient(condition: WeatherCondition) {
  switch (condition) {
    case "sunny":
      return "from-cosmic-gold/20 via-cosmic-dark/80 to-cosmic-dark";
    case "cloudy":
      return "from-cosmic-gray/20 via-cosmic-dark/80 to-cosmic-dark";
    case "partly-cloudy":
      return "from-cosmic-blue/20 via-cosmic-dark/80 to-cosmic-dark";
    case "rainy":
      return "from-cosmic-blue/30 via-cosmic-dark/80 to-cosmic-dark";
    case "snowy":
      return "from-cosmic-light/20 via-cosmic-dark/80 to-cosmic-dark";
    case "foggy":
      return "from-cosmic-gray/15 via-cosmic-dark/80 to-cosmic-dark";
    default:
      return "from-cosmic-blue/20 via-cosmic-dark/80 to-cosmic-dark";
  }
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await weatherApi.getCurrentWeather();
      if (response.data.success && response.data.data) {
        setWeather(response.data.data);
      } else {
        setError("날씨 정보를 불러올 수 없습니다.");
      }
    } catch {
      setError("날씨 API에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // 30분마다 자동 갱신
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 로딩 상태
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="group relative overflow-hidden rounded-xl border border-cosmic-blue/20 
                    bg-gradient-to-br from-cosmic-blue/20 via-cosmic-dark/80 to-cosmic-dark
                    p-6 backdrop-blur-sm"
      >
        <div className="flex h-[200px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cosmic-blue border-t-transparent" />
            <p className="text-sm text-cosmic-gray animate-pulse">날씨 정보 로딩 중...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // 에러 상태
  if (error || !weather) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="group relative overflow-hidden rounded-xl border border-cosmic-red/20 
                    bg-gradient-to-br from-cosmic-red/10 via-cosmic-dark/80 to-cosmic-dark
                    p-6 backdrop-blur-sm"
      >
        <div className="flex h-[200px] flex-col items-center justify-center gap-3">
          <AlertCircle className="h-10 w-10 text-cosmic-red/60" />
          <p className="text-sm text-cosmic-gray">{error || "날씨 정보를 불러올 수 없습니다."}</p>
          <button
            onClick={fetchWeather}
            className="flex items-center gap-1.5 rounded-lg border border-cosmic-blue/30 bg-cosmic-blue/10 px-3 py-1.5 text-xs text-cosmic-light hover:bg-cosmic-blue/20 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            다시 시도
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className={`group relative overflow-hidden rounded-xl border border-cosmic-blue/20 
                  bg-gradient-to-br ${getWeatherGradient(weather.condition)}
                  p-6 backdrop-blur-sm transition-all duration-300
                  hover:border-cosmic-blue/30 hover:shadow-lg hover:shadow-cosmic-blue/5`}
    >
      {/* 배경 장식 - 별 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cosmic-white/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* 상단: 온도와 날씨 아이콘 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm text-cosmic-gray">현재 날씨</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-cosmic-white">
                {weather.temp}°
              </span>
              <span className="text-xl text-cosmic-gray">C</span>
            </div>
            <p className="mt-1 text-cosmic-light">{weather.conditionText}</p>
          </div>

          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {getWeatherIcon(weather.condition)}
          </motion.div>
        </div>

        {/* 중간: 상세 정보 */}
        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-cosmic-blue/10 pt-4">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-cosmic-light" />
            <div>
              <p className="text-xs text-cosmic-gray">체감온도</p>
              <p className="text-sm font-medium text-cosmic-white">
                {weather.feelsLike}°C
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-cosmic-light" />
            <div>
              <p className="text-xs text-cosmic-gray">습도</p>
              <p className="text-sm font-medium text-cosmic-white">
                {weather.humidity}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-cosmic-light" />
            <div>
              <p className="text-xs text-cosmic-gray">풍속</p>
              <p className="text-sm font-medium text-cosmic-white">
                {weather.windSpeed}m/s
              </p>
            </div>
          </div>
        </div>

        {/* 하단: 옷차림 추천 */}
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-cosmic-gold/20 
                        bg-cosmic-gold/10 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg 
                          bg-cosmic-gold/20">
            <Shirt className="h-4 w-4 text-cosmic-gold" />
          </div>
          <div>
            <p className="text-xs font-medium text-cosmic-gold">오늘의 옷차림</p>
            <p className="mt-0.5 text-sm text-cosmic-white/90">
              {weather.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* 배경 글로우 효과 */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full 
                      bg-cosmic-gold/10 blur-3xl transition-all group-hover:bg-cosmic-gold/15" />
    </motion.div>
  );
}

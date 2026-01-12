"use client";

import { CloudSun, Shirt, Umbrella } from "lucide-react";

export function WeatherWidget() {
    // Mock data
    const weather = {
        temp: 18,
        condition: "Partly Cloudy",
        humidity: 45,
        recommendation: "It's a bit chilly. A light jacket or a cardigan would be perfect.",
    };

    return (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-custom-slate to-custom-dark p-6 text-white shadow-md">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                    <CloudSun className="h-12 w-12 text-custom-cream" />
                    <div>
                        <h3 className="text-2xl font-bold">{weather.temp}°C</h3>
                        <p className="text-custom-cream">{weather.condition}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3 rounded-md bg-white/10 p-3 backdrop-blur-sm">
                    <Shirt className="mt-1 h-5 w-5 text-custom-green" />
                    <div>
                        <p className="font-semibold text-custom-green">Outfit Recommendation</p>
                        <p className="text-sm text-gray-200">{weather.recommendation}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

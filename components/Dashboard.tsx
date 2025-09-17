import React from 'react';
import { type TelemetryData } from '../types';
import MetricCard from './MetricCard';
import Gauge from './Gauge';
import BatterySOC from './BatterySOC';

interface DashboardProps {
  telemetry: TelemetryData;
}

const Dashboard: React.FC<DashboardProps> = ({ telemetry }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
      {/* Row 1: Core Voltages and Temperatures */}
      <MetricCard 
        label="Battery Voltage" 
        value={`${telemetry.battery.voltage.toFixed(1)}V`}
        status={telemetry.battery.voltage < 360 ? 'critical' : telemetry.battery.voltage < 380 ? 'warning' : 'normal'}
      />
      <MetricCard 
        label="Battery Temperature" 
        value={`${telemetry.battery.temperature}°C`}
        status={telemetry.battery.temperature > 60 ? 'critical' : telemetry.battery.temperature > 40 ? 'warning' : 'normal'}
      />
      <MetricCard 
        label="Motor Voltage" 
        value={`${telemetry.motor.voltage.toFixed(1)}V`}
        status={Math.abs(telemetry.battery.voltage - telemetry.motor.voltage) > 20 ? 'warning' : 'normal'}
      />
      <MetricCard 
        label="Motor Temperature" 
        value={`${telemetry.motor.temperature}°C`}
        status={telemetry.motor.temperature > 120 ? 'critical' : telemetry.motor.temperature > 90 ? 'warning' : 'normal'}
      />

      {/* Row 2: Currents and Speed */}
      <MetricCard 
        label="Battery Current" 
        value={`${telemetry.battery.current.toFixed(2)}A`}
        status={Math.abs(telemetry.battery.current) > 150 ? 'critical' : Math.abs(telemetry.battery.current) > 100 ? 'warning' : 'normal'}
      />
      <MetricCard 
        label="Motor Current" 
        value={`${telemetry.motor.current.toFixed(2)}A`}
        status={Math.abs(telemetry.motor.current) > 180 ? 'critical' : 'normal'}
      />
      <MetricCard 
        label="Vehicle Speed" 
        value={`${telemetry.vehicle.speed} km/h`}
      />
      {/* This cell can be left empty or used for another metric in the future */}
       <div className="hidden lg:block"></div>
      
      {/* Row 3: Prominent Gauges */}
      <div className="lg:col-span-2">
        <BatterySOC soc={telemetry.battery.soc} />
      </div>
      <div className="lg:col-span-2">
        <Gauge 
          label="Motor RPM"
          value={telemetry.motor.rpm}
          maxValue={8000}
          unit="RPM"
        />
      </div>
    </div>
  );
};

export default Dashboard;
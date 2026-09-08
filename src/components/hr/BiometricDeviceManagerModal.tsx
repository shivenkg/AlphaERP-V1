import React, { useState } from 'react';
import {
  Cpu,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  MapPin,
  Server,
  Activity,
  Search,
  Filter,
  X,
  Fingerprint,
  ScanFace,
  CreditCard,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  AlertTriangle
} from 'lucide-react';
import { BiometricDevice, AttendancePunchLog } from '../../types';
import { storageService } from '../../services/storageService';

interface BiometricDeviceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onDataChanged?: () => void;
}

export const BiometricDeviceManagerModal: React.FC<BiometricDeviceManagerModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
  onDataChanged
}) => {
  const [activeTab, setActiveTab] = useState<'devices' | 'punch_logs' | 'enrollment'>('devices');
  const [devices, setDevices] = useState<BiometricDevice[]>(storageService.getBiometricDevices());
  const [punchLogs, setPunchLogs] = useState<AttendancePunchLog[]>(storageService.getAttendancePunchLogs());

  // Testing connection state per device
  const [testingDeviceId, setTestingDeviceId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; latency: number; message: string }>>({});
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Form modal state (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<BiometricDevice | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('eSSL');
  const [formModel, setFormModel] = useState('');
  const [formDeviceType, setFormDeviceType] = useState<BiometricDevice['deviceType']>('Biometric Fingerprint + Face');
  const [formIpAddress, setFormIpAddress] = useState('192.168.1.');
  const [formPort, setFormPort] = useState(4370);
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formConnectionType, setFormConnectionType] = useState<BiometricDevice['connectionType']>('TCP/IP LAN');
  const [formDirection, setFormDirection] = useState<BiometricDevice['direction']>('Two-Way (In & Out)');
  const [formCommKey, setFormCommKey] = useState('0');
  const [formAutoSyncInterval, setFormAutoSyncInterval] = useState(15);

  // Search in punch logs
  const [logSearch, setLogSearch] = useState('');
  const [logFilterDevice, setLogFilterDevice] = useState('ALL');

  if (!isOpen) return null;

  const refreshLocalData = () => {
    setDevices(storageService.getBiometricDevices());
    setPunchLogs(storageService.getAttendancePunchLogs());
    if (onRefresh) onRefresh();
    if (onDataChanged) onDataChanged();
  };

  const handleOpenAddForm = () => {
    setEditingDevice(null);
    setFormName('');
    setFormBrand('eSSL');
    setFormModel('SilkBio-101TC Dual Terminal');
    setFormDeviceType('Biometric Fingerprint + Face');
    setFormIpAddress('192.168.1.220');
    setFormPort(4370);
    setFormSerialNumber(`DEV-${Date.now().toString().slice(-6)}`);
    setFormLocation('HQ MIDC Andheri East');
    setFormConnectionType('TCP/IP LAN');
    setFormDirection('Two-Way (In & Out)');
    setFormCommKey('0');
    setFormAutoSyncInterval(15);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (device: BiometricDevice) => {
    setEditingDevice(device);
    setFormName(device.name);
    setFormBrand(device.brand || 'eSSL');
    setFormModel(device.model);
    setFormDeviceType(device.deviceType);
    setFormIpAddress(device.ipAddress);
    setFormPort(device.port);
    setFormSerialNumber(device.serialNumber);
    setFormLocation(device.location);
    setFormConnectionType(device.connectionType);
    setFormDirection(device.direction);
    setFormCommKey(device.commKey);
    setFormAutoSyncInterval(device.autoSyncIntervalMinutes || 15);
    setIsFormOpen(true);
  };

  const handleSaveDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formIpAddress.trim()) return;

    if (editingDevice) {
      storageService.updateBiometricDevice(editingDevice.id, {
        name: formName.trim(),
        brand: formBrand,
        model: formModel.trim() || 'Biometric Terminal',
        deviceType: formDeviceType,
        ipAddress: formIpAddress.trim(),
        port: Number(formPort) || 4370,
        serialNumber: formSerialNumber.trim(),
        location: formLocation.trim() || 'Company Premises',
        connectionType: formConnectionType,
        direction: formDirection,
        commKey: formCommKey.trim() || '0',
        autoSyncIntervalMinutes: Number(formAutoSyncInterval) || 15
      });
    } else {
      storageService.addBiometricDevice({
        name: formName.trim(),
        brand: formBrand,
        model: formModel.trim() || 'Biometric Terminal',
        deviceType: formDeviceType,
        ipAddress: formIpAddress.trim(),
        port: Number(formPort) || 4370,
        serialNumber: formSerialNumber.trim() || `SN-${Date.now().toString().slice(-6)}`,
        location: formLocation.trim() || 'Company Premises',
        connectionType: formConnectionType,
        direction: formDirection,
        commKey: formCommKey.trim() || '0',
        enrolledUsersCount: 20,
        autoSyncIntervalMinutes: Number(formAutoSyncInterval) || 15,
        firmwareVersion: 'v4.2.0'
      });
    }

    setIsFormOpen(false);
    refreshLocalData();
  };

  const handleDeleteDevice = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove biometric terminal "${name}"?`)) {
      storageService.deleteBiometricDevice(id);
      refreshLocalData();
    }
  };

  const handleTestConnection = (device: BiometricDevice) => {
    setTestingDeviceId(device.id);
    setTimeout(() => {
      const simulatedLatency = Math.floor(Math.random() * 18) + 8; // 8-26ms
      setTestResults((prev) => ({
        ...prev,
        [device.id]: {
          success: true,
          latency: simulatedLatency,
          message: `TCP socket handshake successful! Response time: ${simulatedLatency}ms. Firmware: ${device.firmwareVersion || 'v4.2.1'}`
        }
      }));
      setTestingDeviceId(null);
    }, 700);
  };

  const handleSyncPunches = (deviceId?: string) => {
    setSyncingDeviceId(deviceId || 'ALL');
    setTimeout(() => {
      const result = storageService.syncBiometricDevicePunches(deviceId);
      setSyncingDeviceId(null);
      setSyncToast(result.message);
      refreshLocalData();
      setTimeout(() => setSyncToast(null), 4000);
    }, 800);
  };

  const filteredPunchLogs = punchLogs.filter((log) => {
    const matchesDevice = logFilterDevice === 'ALL' || log.deviceId === logFilterDevice;
    const matchesSearch =
      !logSearch.trim() ||
      log.empName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.empCode.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.deviceName.toLowerCase().includes(logSearch.toLowerCase());
    return matchesDevice && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">Biometric Attendance Hardware Configuration</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {devices.length} Devices Online
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage eSSL, ZKTeco, Matrix biometric terminals, TCP/IP sockets, and live punch synchronization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Toast Notification */}
        {syncToast && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{syncToast}</span>
            </div>
            <button onClick={() => setSyncToast(null)} className="text-emerald-200 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Sub-Tabs & Actions */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
            <button
              onClick={() => setActiveTab('devices')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'devices'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Configured Terminals ({devices.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('punch_logs')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'punch_logs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Punch Stream ({punchLogs.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSyncPunches()}
              disabled={syncingDeviceId !== null}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${syncingDeviceId === 'ALL' ? 'animate-spin' : ''}`} />
              <span>{syncingDeviceId === 'ALL' ? 'Syncing...' : 'Sync All Terminals'}</span>
            </button>

            <button
              onClick={handleOpenAddForm}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Terminal</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
          {activeTab === 'devices' ? (
            <div className="space-y-4">
              {devices.map((device) => {
                const testResult = testResults[device.id];
                const isTesting = testingDeviceId === device.id;
                const isSyncing = syncingDeviceId === device.id;

                return (
                  <div
                    key={device.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Device Info */}
                      <div className="flex items-start gap-3.5">
                        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0 mt-0.5">
                          {device.deviceType.includes('Face') ? (
                            <ScanFace className="w-5 h-5" />
                          ) : device.deviceType.includes('Fingerprint') ? (
                            <Fingerprint className="w-5 h-5" />
                          ) : (
                            <CreditCard className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900">{device.name}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {device.brand} {device.model}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {device.status}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              {device.direction}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-1.5 gap-x-4 mt-2.5 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Server className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono font-semibold text-slate-800">
                                {device.ipAddress}:{device.port}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{device.location}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-slate-400" />
                              <span>SN: {device.serialNumber}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Last Sync: {device.lastSyncTime || 'Never'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Metrics & Action Buttons */}
                      <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
                        <div className="text-right mr-2 hidden sm:block">
                          <div className="text-[11px] text-slate-400">Total Logs Ingested</div>
                          <div className="text-xs font-mono font-bold text-slate-800">
                            {device.totalPunchesLogged?.toLocaleString() || 0} Punches
                          </div>
                        </div>

                        <button
                          onClick={() => handleTestConnection(device)}
                          disabled={isTesting}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                          title="Test TCP Socket Handshake"
                        >
                          <Wifi className={`w-3.5 h-3.5 text-slate-600 ${isTesting ? 'animate-pulse text-indigo-600' : ''}`} />
                          <span>{isTesting ? 'Pinging...' : 'Test Ping'}</span>
                        </button>

                        <button
                          onClick={() => handleSyncPunches(device.id)}
                          disabled={isSyncing}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors disabled:opacity-50"
                          title="Sync Punches from Device"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
                          <span>{isSyncing ? 'Syncing...' : 'Sync Logs'}</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditForm(device)}
                          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit Device Configuration"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteDevice(device.id, device.name)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Device"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Ping Test Result Banner */}
                    {testResult && (
                      <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-slate-700">{testResult.message}</span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                          {testResult.latency}ms
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Live Raw Punch Stream */
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by employee name, code, or terminal..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter Terminal:</span>
                  <select
                    value={logFilterDevice}
                    onChange={(e) => setLogFilterDevice(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800"
                  >
                    <option value="ALL">All Biometric Terminals</option>
                    {devices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Punch Log Register Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Employee Name</th>
                        <th className="px-4 py-3">Punch Type</th>
                        <th className="px-4 py-3">Verification Sensor</th>
                        <th className="px-4 py-3">Terminal Gate</th>
                        <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredPunchLogs.map((log) => {
                        const isIn = log.punchType === 'Check-In';
                        return (
                          <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3 font-mono font-medium text-slate-800">
                              {log.punchTime || log.timestamp.split('T')[1]?.slice(0, 8)}
                              <div className="text-[10px] text-slate-400">{log.date || log.timestamp.split('T')[0]}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900">{log.empName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{log.empCode}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  isIn
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                }`}
                              >
                                {isIn ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                {log.punchType}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-700 flex items-center gap-1.5 pt-3.5">
                              {log.verificationMode === 'Face Recognition' ? (
                                <ScanFace className="w-3.5 h-3.5 text-indigo-500" />
                              ) : log.verificationMode === 'Fingerprint' ? (
                                <Fingerprint className="w-3.5 h-3.5 text-slate-500" />
                              ) : (
                                <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                              )}
                              <span>{log.verificationMode}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-900">{log.deviceName}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-xs">{log.deviceLocation}</div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {log.status || 'Verified'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>AlphaHR Biometric Ingestion Gateway Active (Auto-poll every 15 mins)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors"
          >
            Close Window
          </button>
        </div>

        {/* ADD / EDIT DEVICE MODAL FORM */}
        {isFormOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold">
                    {editingDevice ? 'Edit Biometric Terminal' : 'Add New Biometric Attendance Device'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDevice} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Terminal Display Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. HQ Main Turnstile Entrance Gate A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Manufacturer Brand</label>
                    <select
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="eSSL">eSSL Security</option>
                      <option value="ZKTeco">ZKTeco India</option>
                      <option value="Matrix">Matrix COSEC</option>
                      <option value="Realtime">Realtime Biometrics</option>
                      <option value="Mantra">Mantra Softech</option>
                      <option value="Hikvision">Hikvision Access</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Model Name / Series</label>
                    <input
                      type="text"
                      value={formModel}
                      onChange={(e) => setFormModel(e.target.value)}
                      placeholder="e.g. SilkBio-101TC"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sensor Verification Type</label>
                    <select
                      value={formDeviceType}
                      onChange={(e) => setFormDeviceType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Biometric Fingerprint + Face">Fingerprint + Face Recognition</option>
                      <option value="Fingerprint Scanner">Optical Fingerprint Only</option>
                      <option value="Facial Recognition AI">AI Facial Recognition</option>
                      <option value="RFID Smart Card">RFID / MIFARE Card Reader</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Punch Direction</label>
                    <select
                      value={formDirection}
                      onChange={(e) => setFormDirection(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Two-Way (In & Out)">Two-Way (In & Out)</option>
                      <option value="Check-In Only">Check-In Only</option>
                      <option value="Check-Out Only">Check-Out Only</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">IP Address (Static LAN) *</label>
                    <input
                      type="text"
                      required
                      value={formIpAddress}
                      onChange={(e) => setFormIpAddress(e.target.value)}
                      placeholder="192.168.1.210"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">TCP Port *</label>
                    <input
                      type="number"
                      required
                      value={formPort}
                      onChange={(e) => setFormPort(Number(e.target.value))}
                      placeholder="4370"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hardware Serial Number</label>
                    <input
                      type="text"
                      value={formSerialNumber}
                      onChange={(e) => setFormSerialNumber(e.target.value)}
                      placeholder="e.g. ZK-2026-HQ-01"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Comm Key / Password</label>
                    <input
                      type="text"
                      value={formCommKey}
                      onChange={(e) => setFormCommKey(e.target.value)}
                      placeholder="Default 0"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Physical Location / Site Gate</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Corporate HQ MIDC Andheri East - Main Security Gate A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs transition-colors"
                  >
                    {editingDevice ? 'Update Terminal' : 'Save Terminal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

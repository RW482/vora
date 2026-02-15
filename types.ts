
export type Route = 'MUM_TO_KOP' | 'KOP_TO_MUM';
export type UserRole = 'Admin' | 'Staff' | 'Driver';
export type Language = 'en' | 'mr';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  linkedVehicleNo?: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface Truck {
  id: string;
  driverName: string;
  driverMobile: string;
  fromStation: string;
  toStation: string;
  weightCapacity: number;
  availableWeight: number;
  status: 'Available' | 'On Route' | 'Completed';
  currentRoute: Route;
  vehicleNo: string;
}

export interface Order {
  id: string;
  partyName: string;
  plotNo: string;
  mobileNo: string;
  brokerName: string;
  weight: number;
  remark: string;
  vehicleAssignedNo?: string;
  rate: number;
  branchId: string;
  route: Route;
  status: 'Pending' | 'Loaded' | 'Delivered';
  bookingDate: string;
}

export const STATIONS = [
  'Mumbai',
  'Panvel',
  'Lonavala',
  'Pune',
  'Satara',
  'Karad',
  'Kolhapur'
];

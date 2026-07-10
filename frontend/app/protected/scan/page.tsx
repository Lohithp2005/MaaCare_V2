"use client"

import { useEffect, useState } from 'react'
import { BarcodeScanner } from 'react-barcode-scanner'
import "react-barcode-scanner/polyfill"
import Button from '@/app/components/ui/Button'
import { FileText } from 'lucide-react'
import { toast } from 'react-toastify'

interface ScanDataType {
    productName: string;
    ingredients: string;
    isSafe: "safe" | "unsafe" | "caution" | "-";
    reason: string;
}

interface ScanProductApiResponse {
    product_name: string;
    product_ingredients: string;
    product_safety: "safe" | "unsafe" | "caution";
    details: string;
}

const page = () => {
    const scanOptions = {
        delay: 500,
        formats: [
            'ean_13', 'ean_8', 'upc_a', 'upc_e',
            'code_128', 'code_39', 'code_93', 'itf', 'codabar',
        ],
    };

    const [scannedData, setScannedData] = useState<ScanDataType>({
        productName: "-",
        ingredients: "-",
        isSafe: "-",
        reason: "-"
    });
    const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [cameraOn, setCameraOn] = useState(false);

    useEffect(() => {
        if (!cameraOn || isLoading || scannedBarcode) return;

        const timeoutId = window.setTimeout(() => {
            if (!cameraOn || isLoading || scannedBarcode) return;
            const message = 'No barcode detected. Move the product closer to the camera and try again.';
            setErrorMessage(message);
            toast.error(message, { position: 'top-center', autoClose: 2500 });
        }, 10000);

        return () => window.clearTimeout(timeoutId);
    }, [cameraOn, isLoading, scannedBarcode]);

    const handleScanBarcode = async (barcodeValue: string) => {
        if (!barcodeValue || isLoading || scannedBarcode === barcodeValue) return;

        setCameraOn(false);
        setIsLoading(true);
        setErrorMessage(null);
        setScannedBarcode(barcodeValue);

        try {
            const response = await fetch('http://localhost:8000/product/scan-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_barcode: barcodeValue }),
            });

            const data: ScanProductApiResponse = await response.json();

            if (!response.ok) throw new Error(data?.details || 'Failed to scan product.');

            setScannedData({
                productName: data.product_name,
                ingredients: data.product_ingredients,
                isSafe: data.product_safety,
                reason: data.details,
            });

            toast.success(`Barcode scanned: ${barcodeValue}`, { position: 'top-center', autoClose: 1800 });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to scan the barcode.';
            setErrorMessage(message);
            toast.error(message, { position: 'top-center', autoClose: 2200 });
            setScannedData({
                productName: '-',
                ingredients: '-',
                isSafe: '-',
                reason: '-',
            });
            setScannedBarcode(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCapture = (barcodes: Array<{ rawValue: string }>) => {
        const rawValue = barcodes[0]?.rawValue;
        if (!rawValue) return;
        toast.info(`Barcode detected: ${rawValue}. Sending to backend...`, { position: 'top-center', autoClose: 1800 });
        void handleScanBarcode(rawValue);
    };

    const handleCameraToggle = () => {
        if (cameraOn) {
            setCameraOn(false);
            return;
        }
        setScannedBarcode(null);
        setErrorMessage(null);
        setScannedData({
            productName: '-',
            ingredients: '-',
            isSafe: '-',
            reason: '-',
        });
        setCameraOn(true);
    };

    return (
        <div className="flex flex-col items-center h-full w-full p-5">
            <h2 className='text-4xl text-center text-slate-600 mt-5 font-semibold'>Scan Food Products</h2>
            <p className="text-slate-500 text-lg mt-1 text-center">
                Scan the barcode of any food product to check if it's safe for <br /> consumption during pregnancy.
            </p>
            <div className="flex gap-10 mt-15 items-start">
                {/* Camera card */}
                <div className="h-90 shadow w-120 px-4 py-3 bg-white rounded-xl flex flex-col justify-center gap-5">
                    <div className="bg-black aspect-video rounded-lg overflow-hidden">
                        {cameraOn && (
                            <BarcodeScanner
                                className="h-full w-full object-cover"
                                options={scanOptions}
                                onCapture={handleCapture}
                                trackConstraints={{ facingMode: 'environment' }}
                            />
                        )}
                    </div>
                    {errorMessage && (
                        <p className="text-sm text-rose-600">{errorMessage}</p>
                    )}
                    <Button
                        text={cameraOn ? 'turn camera off' : 'turn camera on'}
                        className=""
                        onClick={handleCameraToggle}
                    />
                </div>

                {/* Results card */}
                <div className="min-h-100 h-auto max-h-[70vh] w-195 bg-white rounded-xl flex flex-col p-5 overflow-y-auto">
                    <h2 className="flex text-xl font-semibold text-slate-600 items-center self-center gap-2">
                        <span className="text-emerald-500"><FileText size={32} /></span>
                        Product analysis
                    </h2>
                    <div className="border-t border-slate-200 mt-2 w-[80%] self-center h-0"></div>
                    <div className="flex flex-col gap-2 mt-5">
                        <p className="text-slate-400 font-semibold">Product Name:</p>
                        <p>{scannedData?.productName}</p>
                        <p className="text-slate-400 font-semibold">Is it safe?:</p>
                        <p>{scannedData?.isSafe}</p>
                        <p className="text-slate-400 font-semibold">Ingredients:</p>
                        <p>{scannedData?.ingredients}</p>
                        <p className="text-slate-400 font-semibold">Reason and Advice:</p>
                        <p className="rounded-lg bg-slate-100 p-3">{scannedData?.reason}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default page
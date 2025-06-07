import React, { useState, useCallback } from 'react';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { AnchorIdl } from '../types';
import { ExampleIdlSelector } from './ExampleIdlSelector.tsx';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

interface IdlUploaderProps {
  onIdlLoaded: (idl: AnchorIdl) => void;
  currentIdl?: AnchorIdl | null;
}

export const IdlUploader: React.FC<IdlUploaderProps> = ({
  onIdlLoaded,
  currentIdl,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        setError(null);
        const text = await file.text();
        const idl = JSON.parse(text) as AnchorIdl;

        // Basic validation
        if (
          !idl.address ||
          !idl.instructions ||
          !Array.isArray(idl.instructions)
        ) {
          throw new Error('Invalid IDL format: missing required fields');
        }

        onIdlLoaded(idl);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to parse IDL file';
        setError(message);
      }
    },
    [onIdlLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const jsonFile = files.find((file) => file.name.endsWith('.json'));

      if (jsonFile) {
        handleFileUpload(jsonFile);
      } else {
        setError('Please upload a valid JSON file');
      }
    },
    [handleFileUpload]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <div className="space-y-6">
      <Card
        className={`cursor-pointer transition-colors duration-200 ${
          isDragOver
            ? 'border-solana-500 bg-solana-50'
            : currentIdl
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('idl-file-input')?.click()}
      >
        <CardContent className="p-8 text-center">
          <input
            id="idl-file-input"
            type="file"
            accept=".json"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {currentIdl ? (
            <div className="space-y-3">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-green-500" />
              <div className="text-lg font-medium text-green-700">
                IDL Loaded: {currentIdl.metadata.name}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Version: {currentIdl.metadata.version}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Instructions: {currentIdl.instructions.length}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                Click to upload a new IDL file
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-lg font-medium text-gray-700">
                Upload Anchor IDL
              </div>
              <div className="text-sm text-gray-500">
                Drag and drop your IDL JSON file here, or click to browse
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="border-t border-gray-200 pt-6">
        <ExampleIdlSelector onIdlLoaded={onIdlLoaded} />
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            <div className="font-medium">Error loading IDL:</div>
            <div className="text-sm mt-1">{error}</div>
          </AlertDescription>
        </Alert>
      )}

      {currentIdl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Program Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Address:</span>
                <div className="font-mono text-xs text-gray-600 break-all">
                  {currentIdl.address}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-900">Name:</span>
                <div className="text-gray-600">{currentIdl.metadata.name}</div>
              </div>
              <div>
                <span className="font-medium text-gray-900">Version:</span>
                <div className="text-gray-600">
                  {currentIdl.metadata.version}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-900">Instructions:</span>
                <div className="text-gray-600">
                  {currentIdl.instructions.length}
                </div>
              </div>
              {currentIdl.accounts && (
                <div>
                  <span className="font-medium text-gray-900">
                    Account Types:
                  </span>
                  <div className="text-gray-600">
                    {currentIdl.accounts.length}
                  </div>
                </div>
              )}
              {currentIdl.types && (
                <div>
                  <span className="font-medium text-gray-900">
                    Custom Types:
                  </span>
                  <div className="text-gray-600">{currentIdl.types.length}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

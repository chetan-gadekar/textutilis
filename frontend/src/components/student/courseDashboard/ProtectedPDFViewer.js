import React from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';

const ProtectedPDFViewer = ({ fileUrl, title }) => {
    // Initialize toolbar plugin with custom configuration
    const toolbarPluginInstance = toolbarPlugin({
        // Transform toolbar to remove download and print buttons
        getFilePlugin: {
            fileNameGenerator: () => title || 'document.pdf',
        },
    });

    const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

    // Custom toolbar without download and print buttons
    const transform = (slot) => ({
        ...slot,
        Download: () => <></>, // Remove download button
        DownloadMenuItem: () => <></>, // Remove download from menu
        Print: () => <></>, // Remove print button
        PrintMenuItem: () => <></>, // Remove print from menu
    });

    // Prevent context menu (right-click)
    const handleContextMenu = (e) => {
        e.preventDefault();
    };

    return (
        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
            <div
                onContextMenu={handleContextMenu}
                style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    msUserSelect: 'none',
                    MozUserSelect: 'none',
                    height: '750px',
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        alignItems: 'center',
                        backgroundColor: '#eeeeee',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        padding: '4px',
                    }}
                >
                    <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
                </div>
                <div
                    style={{
                        flex: 1,
                        overflow: 'hidden',
                        height: 'calc(100% - 48px)',
                    }}
                >
                    <Viewer
                        fileUrl={fileUrl}
                        plugins={[toolbarPluginInstance]}
                        // Performance optimizations
                        defaultScale={1.0}
                        renderMode="canvas" // Use canvas for better performance
                        enableSmoothScroll={true}
                        theme={{
                            theme: 'light',
                        }}
                    />
                </div>
            </div>
        </Worker>
    );
};

export default ProtectedPDFViewer;

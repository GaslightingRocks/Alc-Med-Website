hey you can findr my website Alcedo-Media here: www.alcedo-online.com
Alcedo-Media ist a media Producer for all kinds of content 


flowchart TD

subgraph group_static_site["Static site"]
  node_cname["Custom domain<br/>hosting config"]
  node_index["Landing page<br/>HTML entry<br/>[index.html]"]
  node_privacy["Privacy page<br/>HTML page<br/>[datenschutz.html]"]
  node_imprint["Imprint page<br/>HTML page<br/>[impressum.html]"]
  node_styles["Shared styles<br/>CSS stylesheet<br/>[style.css]"]
  node_static_host["Static hosting<br/>deployment boundary"]
end

subgraph group_browser["Browser runtime"]
  node_script["Client behavior<br/>browser JavaScript<br/>[JSFIle.js]"]
  node_visitor(("Visitor browser<br/>client"))
end

node_cname -->|"routes domain to"| node_static_host
node_visitor -->|"requests"| node_cname
node_static_host -->|"serves"| node_index
node_index -->|"loads"| node_styles
node_index -->|"loads"| node_script
node_script -->|"runs in"| node_visitor
node_index -->|"links to"| node_privacy
node_index -->|"links to"| node_imprint
node_static_host -->|"serves"| node_privacy
node_static_host -->|"serves"| node_imprint

click node_cname "https://github.com/gaslightingrocks/alc-med-website/blob/main/CNAME"
click node_index "https://github.com/gaslightingrocks/alc-med-website/blob/main/index.html"
click node_privacy "https://github.com/gaslightingrocks/alc-med-website/blob/main/datenschutz.html"
click node_imprint "https://github.com/gaslightingrocks/alc-med-website/blob/main/impressum.html"
click node_styles "https://github.com/gaslightingrocks/alc-med-website/blob/main/style.css"
click node_script "https://github.com/gaslightingrocks/alc-med-website/blob/main/JSFIle.js"

classDef toneNeutral fill:#f8fafc,stroke:#334155,stroke-width:1.5px,color:#0f172a
classDef toneBlue fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px,color:#172554
classDef toneAmber fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f
classDef toneMint fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d
classDef toneRose fill:#ffe4e6,stroke:#e11d48,stroke-width:1.5px,color:#881337
classDef toneIndigo fill:#e0e7ff,stroke:#4f46e5,stroke-width:1.5px,color:#312e81
classDef toneTeal fill:#ccfbf1,stroke:#0f766e,stroke-width:1.5px,color:#134e4a
class node_cname,node_index,node_privacy,node_imprint,node_styles,node_static_host toneBlue
class node_script,node_visitor toneAmber

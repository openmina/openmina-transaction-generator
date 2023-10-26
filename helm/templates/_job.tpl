{{/* Generate transactions job */}}
{{ define "mina-transaction-generator.jobSpec" }}
template:
  spec:
    restartPolicy: Never
    containers:
      - name: main
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        command: ["sh", "-c"]
        args:
          - |
            cp /setup/setup.json .
            npm run start
        volumeMounts:
          - name: config
            mountPath: /setup
    volumes:
      - name: config
        configMap:
          name: {{ include "mina-transaction-generator.fullname" . }}
          items:
            - key: setup.json
              path: setup.json
{{ end }}

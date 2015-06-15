package com.futureprocessing.wsiln.mapreduce;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;
import org.apache.hadoop.conf.Configuration;

import static com.futureprocessing.wsiln.mapreduce.ConfigurationConstants.*;

public class ConfigurationWrapper {

    private final Configuration configuration;
    private String inputPath;
    private String outputPath;


    public ConfigurationWrapper(Configuration configuration) {
        this.configuration = configuration;
    }


    public void parseArguments(String[] args) {

        if (args.length > 0) {
            inputPath = args[0];
        }
        if (args.length > 1) {
            outputPath = args[1];
        }

        OptionParser optionParser = new OptionParser();
        optionParser.allowsUnrecognizedOptions();
        OptionSpec<String> hostOption = optionParser.accepts(ELASTIC_HOST).withOptionalArg().ofType(String.class).defaultsTo("localhost");
        OptionSpec<Integer> portOption = optionParser.accepts(ELASTIC_PORT).withOptionalArg().ofType(Integer.class).defaultsTo(9300);
        OptionSpec<String> indexNameOption = optionParser.accepts(ELASTIC_INDEX_NAME).withOptionalArg().ofType(String.class).defaultsTo("indexName");
        OptionSpec<Integer> minTechnologiesConnections = optionParser.accepts(MIN_NUMBER_OF_TECHNOLOGIES_CONNECTIONS).withOptionalArg().ofType(Integer.class).defaultsTo(2);

        OptionSet optionSet = optionParser.parse(args);

        configuration.setBoolean(USE_ELASTIC_OUTPUT, optionSet.has(hostOption));
        configuration.set(ELASTIC_HOST, optionSet.valueOf(hostOption));
        configuration.setInt(ELASTIC_PORT, optionSet.valueOf(portOption));
        configuration.set(ELASTIC_INDEX_NAME, optionSet.valueOf(indexNameOption));
        configuration.setInt(MIN_NUMBER_OF_TECHNOLOGIES_CONNECTIONS, optionSet.valueOf(minTechnologiesConnections));
    }

    public boolean isUseElastic() {
        return configuration.getBoolean(USE_ELASTIC_OUTPUT, false);
    }

    public String getInputPath() {
        return inputPath;
    }

    public String getElasticHost() {
        return configuration.get(ELASTIC_HOST);
    }

    public int getElasticPort() {
        return configuration.getInt(ELASTIC_PORT, 9300);
    }

    public String getOutputPath() {
        return outputPath;
    }

    public int getMinimumNumberOfTechnologiesConnections() {
        return configuration.getInt(MIN_NUMBER_OF_TECHNOLOGIES_CONNECTIONS, 2);
    }
}

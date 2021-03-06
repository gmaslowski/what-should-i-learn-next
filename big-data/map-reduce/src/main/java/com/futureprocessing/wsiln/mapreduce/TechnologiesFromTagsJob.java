package com.futureprocessing.wsiln.mapreduce;

import com.futureprocessing.wsiln.mapreduce.map.MappingType;
import com.futureprocessing.wsiln.mapreduce.map.RelationKey;
import com.futureprocessing.wsiln.mapreduce.output.ElasticOutputFormat;
import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.conf.Configured;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.util.Tool;
import org.apache.hadoop.util.ToolRunner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.futureprocessing.wsiln.mapreduce.ConfigurationConstants.*;

public class TechnologiesFromTagsJob extends Configured implements Tool {

    private static Logger log = LoggerFactory.getLogger(TechnologiesFromTagsJob.class);

    public int run(String[] args) throws Exception {
        Job job = Job.getInstance(getConf());
        job.setJarByClass(getClass());
        job.setJobName(getClass().getSimpleName());

        FileInputFormat.addInputPath(job, new Path(args[0]));

        parseElasticArguments(args, job.getConfiguration());

        job.setMapperClass(TechnologiesMapper.class);
        job.setMapOutputKeyClass(RelationKey.class);
        job.setMapOutputValueClass(MappingType.class);

        job.setReducerClass(TechnologiesReducer.class);

        job.setOutputKeyClass(RelationKey.class);
        job.setOutputValueClass(IntWritable.class);
        job.setOutputFormatClass(ElasticOutputFormat.class);

        logConfiguration(job);

        return job.waitForCompletion(true) ? 0 : 1;
    }

    private void logConfiguration(Job job) {
        Configuration configuration = job.getConfiguration();
        log.info("Starting job with following configuration: ");
        log.info("Elastic host: {}", configuration.get(ELASTIC_HOST));
        log.info("Elastic port: {}", configuration.get(ELASTIC_PORT));
        log.info("Elastic index name: {}", configuration.get(ELASTIC_INDEX_NAME));
    }

    private void parseElasticArguments(String[] args, Configuration configuration) {

        OptionParser optionParser = new OptionParser();
        optionParser.allowsUnrecognizedOptions();
        OptionSpec<String> hostOption = optionParser.accepts(ELASTIC_HOST).withRequiredArg().ofType(String.class).defaultsTo("localhost");
        OptionSpec<Integer> portOption = optionParser.accepts(ELASTIC_PORT).withRequiredArg().ofType(Integer.class).defaultsTo(9300);
        OptionSpec<String> indexNameOption = optionParser.accepts(ELASTIC_INDEX_NAME).withOptionalArg().ofType(String.class).defaultsTo("indexName");


        OptionSet optionSet = optionParser.parse(args);

        configuration.set(ELASTIC_HOST, optionSet.valueOf(hostOption));
        configuration.setInt(ELASTIC_PORT, optionSet.valueOf(portOption));
        configuration.set(ELASTIC_INDEX_NAME, optionSet.valueOf(indexNameOption));

    }


    public static void main(String[] args) throws Exception {
        int rc = ToolRunner.run(new TechnologiesFromTagsJob(), args);
        System.exit(rc);
    }
}
